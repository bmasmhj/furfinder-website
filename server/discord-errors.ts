interface ErrorContext {
  source?: string;
  method?: string;
  path?: string;
  screen?: string;
}

type SendErrorToDiscord = (error: unknown, context?: ErrorContext) => void;

function createSender(): SendErrorToDiscord {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    return () => {};
  }

  return async (error: unknown, context: ErrorContext = {}) => {
    try {
      const err = error instanceof Error ? error : new Error(String(error));
      const title = (err.message || "Unknown error").slice(0, 256);
      const stack = (err.stack || "No stack trace").slice(0, 4000);

      const fields: Array<{ name: string; value: string; inline: boolean }> = [
        { name: "Source", value: context.source || "unknown", inline: true },
        { name: "Timestamp", value: new Date().toISOString(), inline: true },
      ];

      if (context.method) {
        fields.push({ name: "Method", value: context.method, inline: true });
      }
      if (context.path) {
        fields.push({ name: "Path", value: context.path, inline: true });
      }
      if (context.screen) {
        fields.push({ name: "Screen", value: context.screen, inline: true });
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
