
interface ErrorContext {
  source?: string;
  method?: string;
  path?: string;
  screen?: string;
  deviceInfo?: any;
  userId?: string;
}

type SendErrorToDiscord = (error: any, stack?: string, context?: ErrorContext) => Promise<void>;

function createSender(): SendErrorToDiscord {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    return async () => {};
  }

  return async (error: any, stackTrace?: string, context: ErrorContext = {}) => {
    try {
      const errMessage = typeof error === 'string' ? error : (error.message || "Unknown error");
      const title = `[MobileError] ${errMessage}`.slice(0, 256);
      const stack = (stackTrace || (error instanceof Error ? error.stack : null) || "No stack trace").slice(0, 4000);

      const fields: Array<{ name: string; value: string; inline: boolean }> = [
        { name: "Source", value: context.source || "mobile", inline: true },
        { name: "Timestamp", value: new Date().toISOString(), inline: true },
      ];

      if (context.userId) {
        fields.push({ name: "User ID", value: context.userId, inline: true });
      }
      if (context.deviceInfo) {
        fields.push({ name: "Device Info", value: JSON.stringify(context.deviceInfo).slice(0, 1024), inline: false });
      }

      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [
            {
              title,
              description: `\`\`\`\n${stack}\n\`\`\``,
              color: 0xff0000,
              fields,
            },
          ],
        }),
      });
    } catch {
    }
  };
}

export const sendErrorToDiscord: SendErrorToDiscord = createSender();
