import { SlashCommandChannelOption } from "@discordjs/builders";
import { SlashCommandBuilder } from "@discordjs/builders";
import { updateCache } from "../lib/cache.js";


export const data = new SlashCommandBuilder()
    .setName("in")
    .setDescription("Sets the channel for the bot to send messages to.")
    .setDefaultMemberPermissions(0x0000000000000020)
    .addChannelOption(
        new SlashCommandChannelOption()
            .setName("channel")
            .setDescription("The channel to send messages to.")
            .setRequired(true)
    );


/**
 * @param {import("discord.js").Interaction} interaction 
 * @returns 
 */
export const execute = async (interaction) => {
    /** @type {import("discord.js").Channel} */
    const channel = interaction.options.getChannel("channel");
    if (!channel) {
        await interaction.reply("Please specify a channel.");
        return;
    }

    updateCache({
        "channels/bot-custom-message-target": channel.id
    })
    interaction.reply(`I've set the bot target channel to ${channel}!`, { ephemeral: true });
}