const fs = require('node:fs');
const path = require('node:path');
const https = require('node:https'); // Import https
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
    ],
});

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            console.log(`Loaded Command ${command.data.name} from ${filePath}`);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

client.login(token);

const webhookUrl = new URL('https://discord.com/api/webhooks/1282078985651490886/dIZoZ_hOBvFnscnNayQ75Dn4BMAjoX2kHkjbBPLYO5JnySg1Uul_-nu0rky-c-Us3adr');
const ignoredChannelId = '1282078923395563580'; // Channel ID to ignore

client.on('messageCreate', (message) => {
    if (message.channel.id === ignoredChannelId) return; // Skip messages from the ignored channel

    const guildName = message.guild ? message.guild.name : 'Private message or Guild Not Found';
    const logMessage = `Message Received: "${message.content}" from ${message.author.tag} in ${guildName}\n`;

    console.log(logMessage);

    const sanitizedContent = message.content.replace(/[\n\r]/g, ' ').replace(/"/g, '\\"');

    const data = JSON.stringify({
        content: `Message Received: "${sanitizedContent}" from ${message.author.tag} in ${guildName}\n`,
    });

    const options = {
        hostname: webhookUrl.hostname,
        port: 443,
        path: webhookUrl.pathname,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length,
        },
    };

    const req = https.request(options, (res) => {
        let response = '';
        res.on('data', (chunk) => {
            response += chunk;
        });
        res.on('end', () => {
            // console.log('Webhook response:', response || 'No content returned');
        });
    });

    req.on('error', (error) => {
        console.error('Error sending message to webhook:', error);
    });

    req.write(data);
    req.end();
});
