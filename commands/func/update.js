// commands/update.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

const Gradient = '209986630654623744';
module.exports = {
    data: new SlashCommandBuilder()
        .setName('update')
        .setDescription('Posts an update to all guilds with a designated update channel.')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The update message to post')
                .setRequired(true)
        ),
    
    async execute(interaction) {
	if (interaction.user.id !== Gradient) {
		return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
	}

        const updateMessage = interaction.options.getString('message');
        const guildIds = interaction.client.guilds.cache.map(guild => guild.id);

        let responses = [];

        for (const guildId of guildIds) {
            const filePath = path.join(__dirname, '../data', `${guildId}.json`);
            
            if (fs.existsSync(filePath)) {
                const guildData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                const channelId = guildData.logChannelId;
                const channel = interaction.client.channels.cache.get(channelId);

                if (channel && channel.type === ChannelType.GuildText) {
                    try {
                        await channel.send(updateMessage);
                        responses.push(`Update sent to ${channel.guild.name} (${channel.name})`);
                    } catch (error) {
                        responses.push(`Failed to send update to ${channel.guild.name} (${channel.name}): ${error.message}`);
                    }
                } else {
                    responses.push(`Update channel in ${guildId} is not available or invalid.`);
                }
            } else {
                responses.push(`No update channel set for guild ${guildId}.`);
            }
        }

        await interaction.reply({ content: responses.join('\n'), ephemeral: true });
    },
};

