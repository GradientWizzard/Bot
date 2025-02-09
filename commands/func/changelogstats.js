// commands/changelogstats.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const path = require('path');

const ALLOWED_USER_ID = '209986630654623744'; // Replace with your user ID

module.exports = {
    data: new SlashCommandBuilder()
        .setName('changelogstats')
        .setDescription('Displays the status of changelog channels for all guilds.'),
    
    async execute(interaction) {
        // Check if the user ID matches the allowed user ID
        if (interaction.user.id !== ALLOWED_USER_ID) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const guildIds = interaction.client.guilds.cache.map(guild => guild.id);
        let responses = [];

        for (const guildId of guildIds) {
            const filePath = path.join(__dirname, '../data', `${guildId}.json`);
            
            if (fs.existsSync(filePath)) {
                const guildData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                const channelId = guildData.logChannelId;

                if (channelId) {
                    const channel = interaction.client.channels.cache.get(channelId);
                    if (channel) {
                        responses.push(`${channel.guild.name} has set their changelog channel (${channel.name})`);
                    } else {
                        responses.push(`${channel.guild.name} has set their changelog channel, but the channel is no longer available.`);
                    }
                } else {
                    responses.push(`${channel.guild.name} hasn't set their changelog channel yet.`);
                }
            } else {
                responses.push(`${guildId} hasn't set their changelog channel yet.`);
            }
        }

        await interaction.reply({ content: responses.join('\n'), ephemeral: true });
    },
};

