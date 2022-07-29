// Initialize environment variables
if (!process.env.DISCORD_TOKEN || !process.env.WEBHOOK_URL) {
    (await import("dotenv")).config();
}

/** Secrets */
export const clientId = process.env.CLIENT_ID;
export const clientToken = process.env.DISCORD_TOKEN;

/** Actual Settings */
export const guildID = process.env.GUILD_ID || "988839479731179561";
export const botChannelID = process.env.BOT_CHANNEL_ID || "995616882046546002";
export const feedChannelID = "995620108095471646";