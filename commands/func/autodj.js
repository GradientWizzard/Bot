const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');

const AZURACAST_API_KEY = '6ffbe883ca371f61:56927ff67f695b4d2c3c8371ff0c9484';
const AZURACAST_START_AUTO_DJ_API_URL = 'https://radiopanel.nonameradio.co.uk/api/station/3/backend/start';

async function startAutoDJ(apiKey) {
    try {
        const response = await fetch(AZURACAST_START_AUTO_DJ_API_URL, {
            method: 'POST',
            headers: {
                'X-API-Key': apiKey
            }
        });
        return response.ok;
    } catch (error) {
        console.error('Error starting AutoDJ:', error);
        return false;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autodj')
        .setDescription('Starts the AutoDJ on No Name Radio.'),
    async execute(interaction) {
        if (interaction.user.id !== '209986630654623744') {
            return interaction.reply({ content: 'You do not have permission to use this command. Contact GradientWizzard', ephemeral: true });
        }

        const startSuccess = await startAutoDJ(AZURACAST_API_KEY);
        if (startSuccess) {
            return interaction.reply({ content: 'AutoDJ started successfully.' });
        } else {
            return interaction.reply({ content: 'AutoDJ failed to start.', ephemeral: true });
        }
    },
};

