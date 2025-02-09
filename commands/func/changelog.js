// commands/changelog.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('changelog')
        .setDescription('Sets the channel where updates will be posted.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to set for updates')
                .setRequired(true)
        ),
    
    async execute(interaction) {
        // Check if the user has the necessary permissions
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const channel = interaction.options.getChannel('channel');
        const guildId = interaction.guild.id;

        // Load or create the guild data file
        const filePath = path.join(__dirname, '../data', `${guildId}.json`);
        const guildData = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : {};

        guildData.logChannelId = channel.id;

        // Save the updated data to the file
        fs.writeFileSync(filePath, JSON.stringify(guildData));

        await interaction.reply({ content: `Update channel has been set to ${channel}.`, ephemeral: true });
    },
};

