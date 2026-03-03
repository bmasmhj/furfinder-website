import pool from './db';

export const PUSH_MAX_ATTEMPTS = 3;
export const PUSH_RECEIPT_DELAY_MS = 30_000;
export const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
export const EXPO_RECEIPT_URL = 'https://exp.host/--/api/v2/push/getReceipts';

export type PushTicket =
  | { status: 'ok'; id: string }
  | { status: 'error'; message: string; details?: { error?: string } };

export type PushReceipt =
  | { status: 'ok' }
  | { status: 'error'; message: string; details?: { error?: string } };

export const PERMANENT_ERRORS = new Set(['DeviceNotRegistered', 'InvalidCredentials']);

type DbQuery = (sql: string, params: any[]) => Promise<void>;
type Fetcher = typeof fetch;

let _dbQuery: DbQuery = async (sql, params) => {
  await pool.query(sql, params);
};
let _fetch: Fetcher = fetch;

export function _setDbQueryForTest(mock: DbQuery): void { _dbQuery = mock; }
export function _setFetchForTest(mock: Fetcher): void { _fetch = mock; }
export function _resetDeps(): void {
  _dbQuery = async (sql, params) => { await pool.query(sql, params); };
  _fetch = fetch;
}

export async function clearPushToken(userId: string, pushToken: string): Promise<void> {
  try {
    await _dbQuery(
      'UPDATE users SET push_token = NULL WHERE id = $1 AND push_token = $2',
      [userId, pushToken]
    );
    console.log(`[Push] Cleared stale token for user ${userId}`);
  } catch (err) {
    console.error('[Push] Failed to clear stale token:', err);
  }
}

export async function checkPushReceipt(
  ticketId: string,
  userId: string,
  pushToken: string
): Promise<void> {
  try {
    const res = await _fetch(EXPO_RECEIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ ids: [ticketId] }),
    });
    if (!res.ok) return;
    const json = (await res.json()) as { data: Record<string, PushReceipt> };
    const receipt = json?.data?.[ticketId];
    if (receipt?.status === 'error') {
      const errorType = (receipt as any)?.details?.error as string | undefined;
      console.error(
        `[Push] Receipt error for ticket ${ticketId}: ${receipt.message} (${errorType})`
      );
      if (errorType && PERMANENT_ERRORS.has(errorType)) {
        await clearPushToken(userId, pushToken);
      }
    }
  } catch (err) {
    console.error('[Push] Receipt check error:', err);
  }
}

export async function sendPushNotification(
  pushToken: string | null,
  userId: string,
  title: string,
  body: string,
  data?: object
): Promise<void> {
  if (!pushToken || !pushToken.startsWith('ExponentPushToken[')) return;

  let ticketId: string | null = null;

  for (let attempt = 1; attempt <= PUSH_MAX_ATTEMPTS; attempt++) {
    try {
      const res = await _fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
        },
        body: JSON.stringify({
          to: pushToken,
          title,
          body,
          data: data || {},
          sound: 'default',
          priority: 'high',
        }),
      });

      if (!res.ok) {
        throw new Error(`Expo push API HTTP ${res.status}`);
      }

      const json = (await res.json()) as { data: PushTicket | PushTicket[] };
      const tickets = Array.isArray(json?.data) ? json.data : [json?.data];
      const ticket = tickets[0] as PushTicket;

      if (ticket?.status === 'error') {
        const errorType = (ticket as any)?.details?.error as string | undefined;
        console.error(`[Push] Send error for user ${userId}: ${ticket.message} (${errorType})`);
        if (errorType && PERMANENT_ERRORS.has(errorType)) {
          await clearPushToken(userId, pushToken);
        }
        return;
      }

      if (ticket?.status === 'ok' && (ticket as any).id) {
        ticketId = (ticket as any).id;
        console.log(`[Push] Sent to user ${userId}, ticket ${ticketId}`);
      }

      break;
    } catch (err) {
      console.error(
        `[Push] Attempt ${attempt}/${PUSH_MAX_ATTEMPTS} failed for user ${userId}:`,
        err
      );
      if (attempt < PUSH_MAX_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  if (ticketId) {
    const capturedTicketId = ticketId;
    const timer = setTimeout(() => {
      checkPushReceipt(capturedTicketId, userId, pushToken).catch(() => {});
    }, PUSH_RECEIPT_DELAY_MS);
    timer.unref();
  }
}
