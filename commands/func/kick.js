const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kicks a specified user from the server.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to kick')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for kicking the user')
                .setRequired(false)
        ),
    
    /**
     * Executes the command.
     * @param {CommandInteraction} interaction - The interaction object.
     */
    async execute(interaction) {
        // Check if the user has the necessary permissions
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        // Check if the user is a bot
        if (user.bot) {
            return interaction.reply({ content: 'You cannot kick a bot!', ephemeral: true });
        }

        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        // Check if the member is in the server
        if (!member) {
            return interaction.reply({ content: 'The specified user is not in this server.', ephemeral: true });
        }

        // Kick the member
        try {
            await member.kick(reason);
            await interaction.reply({ content: `Successfully kicked ${user.tag} from the server.`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error trying to kick the user!', ephemeral: true });
        }
    },
};

