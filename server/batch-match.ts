import OpenAI from 'openai';
import pool from './db';
import { sendPushNotification } from './push';

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const BATCH_RADIUS_KM = 10;
const CONFIDENCE_THRESHOLD = 50;
const MAX_LOST_PER_RUN = 40;
const MAX_FOUND_POOL = 300;
const CANDIDATES_PER_REPORT = 10;
const AI_DELAY_MS = 1500;

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getRowPhotos(row: any): string[] {
  const uris: string[] =
    typeof row.photo_uris === 'string'
      ? JSON.parse(row.photo_uris || '[]')
      : Array.isArray(row.photo_uris)
      ? row.photo_uris
      : [];
  const photos = uris.length > 0 ? uris : row.photo_uri ? [row.photo_uri] : [];
  return photos.filter((p: string) => p && (p.startsWith('data:') || p.startsWith('http')));
}

export interface BatchRunResult {
  processed: number;
  newMatches: number;
  startedAt: string;
  finishedAt: string;
}

export let lastRunResult: BatchRunResult | null = null;
export let batchRunning = false;

export async function runBatchMatch(): Promise<BatchRunResult> {
  if (batchRunning) {
    console.log('[BatchMatch] Already running — skipping');
    return { processed: 0, newMatches: 0, startedAt: new Date().toISOString(), finishedAt: new Date().toISOString() };
  }

  batchRunning = true;
  const startedAt = new Date().toISOString();
  let processed = 0;
  let newMatches = 0;

  try {
    console.log('[BatchMatch] Starting run...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_match_queue (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        lost_report_id UUID NOT NULL REFERENCES pet_reports(id) ON DELETE CASCADE,
        found_report_id UUID NOT NULL REFERENCES pet_reports(id) ON DELETE CASCADE,
        confidence INTEGER NOT NULL,
        reason TEXT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        reviewed_at TIMESTAMPTZ,
        UNIQUE(lost_report_id, found_report_id)
      )
    `);

    const lostRows = await pool.query(
      `SELECT id, pet_type, pet_name, breed, size, color, markings, description,
              latitude, longitude, location_name, last_seen_date, photo_uri, photo_uris, user_id
       FROM pet_reports
       WHERE status = 'lost'
         AND created_at > NOW() - INTERVAL '90 days'
       ORDER BY created_at DESC
       LIMIT $1`,
      [MAX_LOST_PER_RUN]
    );

    const foundRows = await pool.query(
      `SELECT id, pet_type, pet_name, breed, size, color, markings, description,
              latitude, longitude, location_name, last_seen_date, photo_uri, photo_uris
       FROM pet_reports
       WHERE status = 'found'
         AND created_at > NOW() - INTERVAL '90 days'
       ORDER BY created_at DESC
       LIMIT $1`,
      [MAX_FOUND_POOL]
    );

    const lostReports = lostRows.rows;
    const foundReports = foundRows.rows;
    console.log(`[BatchMatch] ${lostReports.length} lost, ${foundReports.length} found`);

    for (const lost of lostReports) {
      const nearby = foundReports.filter(found => {
        if (found.pet_type !== lost.pet_type) return false;
        if (lost.latitude && lost.longitude && found.latitude && found.longitude) {
          if (getDistance(lost.latitude, lost.longitude, found.latitude, found.longitude) > BATCH_RADIUS_KM) {
            return false;
          }
        }
        return true;
      });

      if (nearby.length === 0) continue;

      const existingResult = await pool.query(
        `SELECT found_report_id FROM admin_match_queue WHERE lost_report_id = $1`,
        [lost.id]
      );
      const alreadyChecked = new Set(existingResult.rows.map((r: any) => r.found_report_id));
      const unprocessed = nearby.filter(f => !alreadyChecked.has(f.id)).slice(0, CANDIDATES_PER_REPORT);

      if (unprocessed.length === 0) continue;

      processed++;

      const targetSummary = `LOST ${lost.pet_type.toUpperCase()} "${lost.pet_name}", breed: ${lost.breed}, size: ${lost.size}, color: ${lost.color}, markings: "${lost.markings}", location: ${lost.location_name}, date: ${lost.last_seen_date}, description: "${lost.description}"`;

      const userContent: any[] = [
        { type: 'text', text: `TARGET (LOST PET):\n${targetSummary}\n` }
      ];

      for (const photo of getRowPhotos(lost).slice(0, 2)) {
        userContent.push({ type: 'image_url', image_url: { url: photo, detail: 'low' } });
      }

      for (let i = 0; i < unprocessed.length; i++) {
        const c = unprocessed[i];
        userContent.push({
          type: 'text',
          text: `\nCANDIDATE ${i + 1} (id: ${c.id}) — FOUND ${c.pet_type} "${c.pet_name || 'unknown'}", breed: ${c.breed}, size: ${c.size}, color: ${c.color}, markings: "${c.markings}", location: ${c.location_name}, date: ${c.last_seen_date}`,
        });
        for (const photo of getRowPhotos(c).slice(0, 1)) {
          userContent.push({ type: 'image_url', image_url: { url: photo, detail: 'low' } });
        }
      }

      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-5.2',
          messages: [
            {
              role: 'system',
              content: `You are an AI pet matching system running an admin batch scan. Match the lost pet against each found candidate using breed, color, markings, size, photos, and location. This is a probabilistic match — never claim certainty.

Return JSON: {"matches": [{"id": "<found_report_id>", "confidence": <0-100>, "reason": "<1-2 sentence explanation>"}]}
Only include matches with confidence >= ${CONFIDENCE_THRESHOLD}. Confidence scale: 90+=near certain, 70-89=strong, 50-69=moderate. Return ONLY valid JSON.`,
            },
            { role: 'user', content: userContent },
          ],
          response_format: { type: 'json_object' },
          max_completion_tokens: 1024,
        });

        const raw = completion.choices[0]?.message?.content || '{"matches":[]}';
        let parsed: { matches: Array<{ id: string; confidence: number; reason: string }> };
        try {
          parsed = JSON.parse(raw);
        } catch {
          parsed = { matches: [] };
        }

        for (const m of parsed.matches || []) {
          if (m.confidence < CONFIDENCE_THRESHOLD) continue;
          try {
            const insertResult = await pool.query(
              `INSERT INTO admin_match_queue (lost_report_id, found_report_id, confidence, reason)
               VALUES ($1, $2, $3, $4)
               ON CONFLICT (lost_report_id, found_report_id) DO NOTHING
               RETURNING id`,
              [lost.id, m.id, Math.min(100, Math.max(0, m.confidence)), m.reason]
            );
            if ((insertResult.rowCount ?? 0) > 0) newMatches++;
          } catch (err) {
            console.error('[BatchMatch] Insert error:', err);
          }
        }

        await new Promise(resolve => setTimeout(resolve, AI_DELAY_MS));
      } catch (err) {
        console.error(`[BatchMatch] AI error for lost report ${lost.id}:`, err);
        await new Promise(resolve => setTimeout(resolve, AI_DELAY_MS));
      }
    }

    console.log(`[BatchMatch] Done. Processed ${processed}, new matches: ${newMatches}`);

    if (newMatches > 0) {
      const admins = await pool.query(`SELECT id, push_token FROM users WHERE role = 'admin'`);
      const title = `${newMatches} probable pet match${newMatches !== 1 ? 'es' : ''} found`;
      const message = `The automated scan found ${newMatches} new potential match${newMatches !== 1 ? 'es' : ''} to review in your admin panel.`;

      for (const admin of admins.rows) {
        try {
          await pool.query(
            `INSERT INTO notifications (user_id, type, title, message)
             VALUES ($1, 'ai_match', $2, $3)`,
            [admin.id, title, message]
          );
          sendPushNotification(admin.push_token, admin.id, title, message, {
            type: 'admin_batch_match',
          }).catch((err: any) => console.error('[BatchMatch] Push error:', err));
        } catch (err) {
          console.error('[BatchMatch] Admin notify error:', err);
        }
      }
    }
  } catch (err) {
    console.error('[BatchMatch] Fatal error:', err);
  } finally {
    batchRunning = false;
  }

  const finishedAt = new Date().toISOString();
  lastRunResult = { processed, newMatches, startedAt, finishedAt };
  return lastRunResult;
}

export function scheduleBatchMatch(): void {
  function msUntil3am(): number {
    const now = new Date();
    const next3am = new Date();
    next3am.setHours(3, 0, 0, 0);
    if (next3am <= now) next3am.setDate(next3am.getDate() + 1);
    return next3am.getTime() - now.getTime();
  }

  function scheduleNext() {
    const ms = msUntil3am();
    const nextRun = new Date(Date.now() + ms);
    console.log(`[BatchMatch] Scheduled daily run at ${nextRun.toISOString()}`);
    setTimeout(() => {
      runBatchMatch()
        .then(r => console.log('[BatchMatch] Daily run result:', r))
        .catch(err => console.error('[BatchMatch] Daily run failed:', err))
        .finally(scheduleNext);
    }, ms).unref();
  }

  scheduleNext();
}
