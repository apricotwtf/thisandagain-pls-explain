import { SlashCommandStringOption } from "@discordjs/builders";
import fetch from "node-fetch"
import { SlashCommandBuilder } from "@discordjs/builders";
import { Permissions } from "discord.js";
import { SlashCommandUserOption } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import { fetchScratch } from "../feed/data.js";
export const data = new SlashCommandBuilder()
    .setName("user")
    .setDescription("Check a user's profile.")
    .setDefaultMemberPermissions(Permissions.DEFAULT)
    .addUserOption(
        new SlashCommandUserOption()
            .setName("user")
            .setDescription("Target user to check")
    )

/**
 * @param {import("discord.js").CommandInteraction} interaction 
 * @param {import("mongodb").Db} db
 * @returns 
 */
export const execute = async (interaction, db) => {
    const users = db.collection("users");
    const discordUser = interaction.options.getUser("user") || interaction.member;
    const user = await users.findOne({
        user: discordUser.id,
    });
    if (!user || user.accounts.length === 0) {
        interaction.reply({
            content: "This user has not added an account.",
        });
        return;
    }
    const data = await fetchScratch(user.name);
    interaction.reply({
        content: "This user has added an account.",
        embeds: await Promise.all(
            user.accounts.map(async (account) => {
                const data = await fetchScratch(account.name);
                
                return new MessageEmbed()
                    .setAuthor({
                        name: data.username,
                        iconURL:  `https://cdn2.scratch.mit.edu/get_image/user/${account.id}_70x70.png`,
                    })
                    .setURL(`https://scratch.mit.edu/users/${data.username}/`)
                    .setDescription(data.profile.bio)
            })
        )
    });
}