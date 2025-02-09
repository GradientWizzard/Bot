const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('commands')
        .setDescription('Displays a list of all available commands.'),
    
    /**
     * Executes the command.
     * @param {CommandInteraction} interaction - The interaction object.
     */
    async execute(interaction) {
        const commandsList = interaction.client.commands.map(command => {
            const description = command.data.description;
            return `\`/${command.data.name}\` - ${description}`;
        }).join('\n');

        const embed = {
            color: 0x0099ff,
            title: 'Available Commands',
            description: commandsList,
            footer: {
                text: 'Use /<command> to execute a command.',
            },
            timestamp: new Date(),
        };

        await interaction.reply({ embeds: [embed] });
    },
};

