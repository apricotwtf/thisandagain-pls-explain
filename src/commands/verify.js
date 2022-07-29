import fetch from "node-fetch"
import { SlashCommandBuilder, SlashCommandStringOption, SlashCommandUserOption, SlashCommandSubcommandGroupBuilder } from "@discordjs/builders";
import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { Permissions } from "discord.js";
export const data = new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Verifies you with Scratch.")
    .setDefaultMemberPermissions(Permissions.DEFAULT)
    .addSubcommand(
        (subcommand) =>
            subcommand
                .setName("start")
                .setDescription("Starts the verification process.")
    )
    .addSubcommand(
        (subcommand) =>
            subcommand
                .setName("check")
                .setDescription("Checks/Completes your verification flow status.")
    )
    .addSubcommand(
        (subcommand) =>
            subcommand
                .setName("delete")
                .setDescription("Deletes all your accounts.")
    )
    .addSubcommand(
        (subcommand) =>
            subcommand
                .setName("clear-token")
                .setDescription("Clears your verification token.")

    )
    .addSubcommand(
        (subcommand) =>
            subcommand
                .setName("force")
                .setDescription("Force verify a certain user")
                .addUserOption(
                    new SlashCommandUserOption()
                        .setName("user")
                        .setDescription("Target user to verify")
                        .setRequired(true)
                )
                .addStringOption(
                    new SlashCommandStringOption()
                        .setName("scratch")
                        .setDescription("Target user's Scratch username")
                        .setRequired(true)
                )
    )
    .addSubcommand(
        (subcommand) =>
            subcommand
                .setName("main")
                .setDescription("Sets a user's main account.")
                .addStringOption(
                    new SlashCommandStringOption()
                        .setName("scratch")
                        .setDescription("This user's server nick will be updated to reflect this.")
                        .setRequired(true)
                )
                .addUserOption(
                    new SlashCommandUserOption()
                        .setName("user")
                        .setDescription("The user to set the main account for.")
                )   
    )

/**
 * @param {import("discord.js").CommandInteraction} interaction 
 * @param {import("mongodb").Db} db
 * @returns 
 */
export const execute = async (interaction, db) => {
    // Start verification
    const verification = db.collection("verification");
    const users = db.collection("users");
    const type = interaction.options.getSubcommand();
    if (type === "start") {
        // Check if user is already verified
        const user = await verification.findOne({
            user: interaction.member.id,
        });
        if (user) {
            interaction.reply({
                content: "You still have a pending token! Use /verify clear-token to clear your pending token. Then, you can use /verify start to start a new one.",
                ephemeral: true,
            });
            return;
        }
        const d = await verification.insertOne({
            user: interaction.member.id,
        });
        // Send verification code
        interaction.reply({
            ephemeral: true,
            content: `Your verification code is ${d.insertedId}. Please comment this code on the following scratch project: https://scratch.mit.edu/projects/531190745\nAfter that, please use /verify check to link your account.`,
        });
    } else if (type === "clear-token") {
        // Check if user is already verified
        const user = await verification.findOne({
            user: interaction.member.id,
        });
        if (user === null) {
            interaction.reply({
                content: "You don't have a pending token!",
                ephemeral: true,
            });
            return;
        }
        await verification.deleteMany({
            user: interaction.member.id,
        });
        interaction.reply({
            content: "Your pending token has been cleared!",
            ephemeral: true,
        });
    } else if (type === "check") {
        // Check if user is already verified
        const user = await verification.findOne({
            user: interaction.member.id,
        });
        if (user === null) {
            interaction.reply({
                content: "You don't have a pending token!",
                ephemeral: true,
            });
            return;
        }
        // Verify user
        const id = user._id.toString();
        // Check Scratch
        const res = await fetch(`https://api.scratch.mit.edu/users/9gr/projects/531190745/comments`);
        const comments = await res.json();
        const comment = comments.find(c => c.content === id);
        if (comment === undefined) {
            interaction.reply({
                content: "You haven't commented the verification code yet!",
                ephemeral: true,
            });
            return;
        }
        // Delete token
        await verification.deleteMany({
            user: interaction.member.id,
        });
        // Add user to database
        let userData = await users.findOne({
            user: interaction.member.id,
        });
        if (userData === null) {
            await users.insertOne({
                user: interaction.member.id,
                accounts: [],
            });
        }
        if (userData?.accounts?.find((u) => u.id === comment.author.id)) return interaction.reply({
            content: "This account you verified is already linked to your account!",
            ephemeral: true,
        });
        await users.updateOne({
            user: interaction.member.id,
        }, {
            $push: {
                accounts: {
                    name: comment.author.username,
                    id: comment.author.id,
                    verifiedAt: new Date().toUTCString(),
                }
            }
        });
        interaction.reply({
            content: `Your account (${comment.author.username}#${comment.author.id}) has been verified!`,
        })
    } else if (type === "delete") {
        // Check if user is already verified
        const user = await users.findOne({
            user: interaction.member.id,
        });
        if (user === null) {
            interaction.reply({
                content: "You don't have an entry in our database!",
                ephemeral: true,
            });
            return;
        }
        // Delete token
        await verification.deleteMany({
            user: interaction.member.id,
        });
        interaction.reply({
            content: "Your account has been deleted from our database!",
            ephemeral: true,
        });
    } else if (type === "force") {
        const user = interaction.options.getUser("user");
        const scratch = interaction.options.getString("scratch");
        let userData = await users.findOne({
            user: user.id,
        });
        if (userData === null) {
            await users.insertOne({
                user: user.id,
                accounts: [],
            });
        }
        if (userData?.accounts?.find((u) => u.name === scratch)) return interaction.reply({
            content: `This account you verified is already linked to <@${user.id}>'s account!`,
            ephemeral: true,
        });
        const acc = {
            name: scratch,
            id: scratch,
            verifiedAt: new Date().toUTCString(),
        }
        await users.updateOne({
            user: user.id,
        }, {
            $push: {
                accounts: acc
            }
        });
        userData = 
        interaction.reply({
            content: `<@${user.id}> account (${scratch}) has been verified!`,
            ephemeral: true
        })

    } else if (type === "main") {
        const user = interaction.options.getUser("user") || interaction.member;
        if (!interaction.memberPermissions.has("MANAGE_GUILD") && user !== interaction.member) {
            interaction.reply({
                content: "You don't have permission to set that user's main account!",
                ephemeral: true,
            });
            return;
        }
        const scratch = interaction.options.getString("scratch");
        const userData = await users.findOne({
            user: user.id,
        });
        if (userData === null) {
            return interaction.reply({
                content: "You don't have an entry in our database!",
                ephemeral: true,
            })
        }
        if (!userData?.accounts?.find((u) => u.name === scratch)) return interaction.reply({
            content: `This account isn't linked to <@${user.id}>'s account!`,
            ephemeral: true,
        });
        await users.updateOne({
            user: user.id,
        }, {
            $set: {
                main: scratch
            }
        });
        (await interaction.guild.members.fetch(user.id)).setNickname(scratch);
        interaction.reply({
            content: `<@${user.id}>'s main account has been set to ${scratch}!`,
            ephemeral: true,
        })
    }
}