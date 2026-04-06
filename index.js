const { Client, GatewayIntentBits, Collection, Events } = require('discord.js');
const fs = require('fs');
const path = require('path');
const logger = require('./utils/logger');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ]
});

client.commands = new Collection();

// Command Loader
const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    if (!fs.statSync(folderPath).isDirectory()) {
        const file = folder; // handle files in commands/ directly if any
        if (file.endsWith('.js')) {
            const command = require(path.join(commandsPath, file));
            client.commands.set(command.data.name, command);
        }
        continue;
    }
    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(folderPath, file);
        const command = require(filePath);
        client.commands.set(command.data.name, command);
    }
}

// Event Loader
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

client.once(Events.ClientReady, c => {
	logger.log(`Ready! Logged in as ${c.user.tag} 🍑✨`, 'success');
});

// 🛡️ CRITICAL: Handle network/timeout errors without crashing!
client.on('error', error => {
    logger.error('Discord Client Error:', error);
});

process.on('unhandledRejection', error => {
	logger.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', error => {
    logger.error('Uncaught Exception:', error);
});

client.login(process.env.DISCORD_TOKEN);
