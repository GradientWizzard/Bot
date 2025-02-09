const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fetchguilds')
        .setDescription('Fetches the list of guilds the bot is in.'),
    async execute(interaction) {
        // Check if the user issuing the command is the bot owner
        if (interaction.user.id !== '209986630654623744') {
            return interaction.reply({ content: 'You do not have permission to use this command, contact GradientWizzard.', ephemeral: true });
        }

        // Fetch the list of guilds the bot is in
        try {
            const guilds = interaction.client.guilds.cache.map(guild => guild.name);
            return interaction.reply({ content: `Guilds:\n${guilds.join('\n')}` });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'Failed to fetch guilds.', ephemeral: true });
        }
    },
};
