const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');

const AZURACAST_API_KEY = '6ffbe883ca371f61:56927ff67f695b4d2c3c8371ff0c9484';
const AZURACAST_API_URL = 'https://radiopanel.nonameradio.co.uk/api/station/3/backend/stop';

async function stopStreamer(apiKey) {
    try {
        const response = await fetch(AZURACAST_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': apiKey
            }
        });
        return response.ok;
    } catch (error) {
        console.error('Error stopping streamer:', error);
        return false;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dc')
        .setDescription('Disconnects the current streamer on No Name Radio.'),
    async execute(interaction) {
        if (interaction.user.id !== '209986630654623744') {
            return interaction.reply({ content: 'You do not have permission to use this command. Contact GradientWizzard', ephemeral: true });
        }

        const success = await stopStreamer(AZURACAST_API_KEY);
        if (success) {
            return interaction.reply({ content: 'Streamer disconnected successfully.' });
        } else {
            return interaction.reply({ content: 'Failed to disconnect the streamer.', ephemeral: true });
        }
    },
};

