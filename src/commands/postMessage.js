import { SlashCommandStringOption } from "@discordjs/builders";
import { SlashCommandChannelOption, SlashCommandBuilder } from "@discordjs/builders";
import { Permissions } from "discord.js";
import { updateCache } from "../lib/cache.js";


export const data = new SlashCommandBuilder()
    .setName("postmessage")
    .setDescription("Send a message as the bot.")
    .setDefaultMemberPermissions(Permissions.FLAGS.MANAGE_GUILD)
    .addChannelOption(
        new SlashCommandChannelOption()
            .setName("target")
            .setDescription("The channel to send messages to.")
            .setRequired(true)
    )
    .addStringOption(
        new SlashCommandStringOption()
            .setName("message")
            .setDescription("The message to send.")
            .setRequired(true)
    );


/**
 * @param {import("discord.js").CommandInteraction} interaction 
 * @returns 
 */
export const execute = async (interaction) => {
    /** @type {import("discord.js").GuildTextBasedChannel} */
    const channel = interaction.options.getChannel("target");
    const message = interaction.options.getString("message");

    const sent = await channel.send(message);
    interaction.reply({
        ephemeral: true,
        content: `[Message sent](${sent.url})!`,
    })
}