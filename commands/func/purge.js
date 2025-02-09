const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Deletes a specified number of messages from a channel.')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('The number of messages to delete')
                .setRequired(true)
        ),
    
    /**
     * Executes the command.
     * @param {CommandInteraction} interaction - The interaction object.
     */
    async execute(interaction) {
        // Check if the user has the necessary permissions
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const amount = interaction.options.getInteger('amount');

        if (amount < 1 || amount > 100) {
            return interaction.reply({ content: 'Please provide a number between 1 and 100.', ephemeral: true });
        }

        // Fetch and delete messages
        try {
            const messages = await interaction.channel.bulkDelete(amount, true);
            return interaction.reply({ content: `Successfully deleted ${messages.size} messages.`, ephemeral: true });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'There was an error trying to delete messages in this channel!', ephemeral: true });
        }
    },
};

