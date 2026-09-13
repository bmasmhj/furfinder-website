"use server";

import { z } from "zod";

const betaRequestSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address.").max(320),
  platform: z.enum(["Android"]),
});

type SubmitBetaRequestResult =
  | { success: true }
  | {
      success: false;
      error: string;
      code: "INVALID_INPUT" | "SERVICE_UNAVAILABLE" | "SUBMISSION_FAILED";
    };

const WEBHOOK_TIMEOUT_MS = 8000;

export async function submitBetaRequest(
  email: string,
  platform: string
): Promise<SubmitBetaRequestResult> {
  const parsed = betaRequestSchema.safeParse({ email, platform });
  if (!parsed.success) {
    return {
      success: false,
      code: "INVALID_INPUT",
      error: parsed.error.issues[0]?.message ?? "Please check your details and try again.",
    };
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn("DISCORD_WEBHOOK_URL is not set");
    return {
      success: false,
      code: "SERVICE_UNAVAILABLE",
      error: "Android beta requests are temporarily unavailable. Please try again shortly.",
    };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [
          {
            title: "🚀 New Beta Testing Request",
            description: "A user has requested access to the beta testing program.",
            color: 0x7c3aed, // primary/violet-600 roughly
            fields: [
              { name: "Email", value: parsed.data.email.toLowerCase(), inline: true },
              { name: "Platform", value: parsed.data.platform, inline: true },
              { name: "Timestamp", value: new Date().toISOString(), inline: false },
            ],
            footer: {
              text: "Fur Finder Beta Portal",
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Discord API error", {
        status: response.status,
        body: errorText,
      });
      return {
        success: false,
        code: "SUBMISSION_FAILED",
        error:
          response.status === 429
            ? "Too many requests right now. Please wait a moment and try again."
            : "We couldn't submit your request. Please try again in a moment.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to submit beta request to Discord:", error);
    return {
      success: false,
      code: "SUBMISSION_FAILED",
      error: "We couldn't submit your request due to a network issue. Please try again.",
    };
  }
}
