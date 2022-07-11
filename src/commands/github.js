import { SlashCommandBuilder } from "@discordjs/builders";


export const data = new SlashCommandBuilder()
    .setName("github")
    .setDescription("Gets the github link of the bot");

/**
 * @param {import("discord.js").Interaction} interaction 
 * @returns 
 */
export const execute = async (interaction) => {
    interaction.reply("Check out https://github.com/Weredime/thisandagain-pls-explain", { ephemeral: true });
}