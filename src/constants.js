// Initialize environment variables
if (!process.env.DISCORD_TOKEN || !process.env.WEBHOOK_URL) {
    (await import('dotenv')).config();
}

/** Secrets */
export const clientId = process.env.CLIENT_ID;
export const clientToken = process.env.DISCORD_TOKEN;
export const webhookURL = process.env.WEBHOOK_URL;

/** Actual Settings */
export const guildID = process.env.GUILD_ID || "988839479731179561";
export const botChannelID = process.env.BOT_CHANNEL_ID || "995616882046546002";