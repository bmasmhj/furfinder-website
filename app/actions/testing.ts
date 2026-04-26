"use server";

export async function submitBetaRequest(email: string, platform: string) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.warn("DISCORD_WEBHOOK_URL is not set");
    // We return success true in dev if webhook is missing to allow UI testing, 
    // or return error. Let's return error but log it.
    return { success: false, error: "Configuration error: Webhook URL missing" };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [
          {
            title: "🚀 New Beta Testing Request",
            description: "A user has requested access to the beta testing program.",
            color: 0x7c3aed, // primary/violet-600 roughly
            fields: [
              { name: "Email", value: email, inline: true },
              { name: "Platform", value: platform, inline: true },
              { name: "Timestamp", value: new Date().toISOString(), inline: false },
            ],
            footer: {
              text: "Fur Finder Beta Portal",
            }
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Discord API error:", errorText);
      throw new Error(`Discord API responded with ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to submit beta request to Discord:", error);
    return { success: false, error: "Failed to send request. Please try again later." };
  }
}
