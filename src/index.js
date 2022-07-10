import fs from "node:fs";
import { botChannelID, clientId, clientToken, guildID } from "./constants.js";

import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { Client, Intents } from "discord.js";
import { Collection } from "discord.js";
import { getCacheItem } from "./lib/cache.js";

const staticCommands = [];
const commands = new Collection();
const commandFiles = fs.readdirSync("./src/commands").filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
    const command = await import(`./commands/${file}`);

    staticCommands.push(command.data.toJSON());
    commands.set(command.data.name, command);
}

if (process.argv.includes("update-commands")) {
    console.log("Updating commands")
    const rest = new REST({ version: 10 }).setToken(clientToken);

    try {
        console.log("Refreshing application (/) commands");

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildID),
            { body: staticCommands }
        );
        console.log("Application commands refreshed");
    } catch(ex) {
        console.log(`Error refreshing commands: ${ex}`);
    }
}

// Start webhooks
import "./webhook.js"
// Now, we can start our client.
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
    ]
});
client.commands = commands;

client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);

    client.user.setActivity("over the forums", { type: "WATCHING" });
});
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});
client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    if (message.channelId === botChannelID) {
        const target = getCacheItem("channels/bot-custom-message-target");
        const general = client.channels.cache.get(target) || await client.channels.fetch(target);
        general.send(message.content);
    }
});

client.login(clientToken);