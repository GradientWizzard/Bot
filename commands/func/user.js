const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Displays detailed information about the specified user or yourself.')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to get the information of')
                .setRequired(false)
        ),
    
    /**
     * Executes the command.
     * @param {CommandInteraction} interaction - The interaction object.
     */
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const member = await interaction.guild.members.fetch(user.id);

        const embed = {
            color: 0x0099ff,
            title: `${user.username}'s Information`,
            thumbnail: {
                url: user.displayAvatarURL({ dynamic: true, size: 512 }),
            },
            fields: [
                { name: 'Username', value: user.username, inline: true },
                { name: 'Discriminator', value: `#${user.discriminator}`, inline: true },
                { name: 'ID', value: user.id, inline: true },
                { name: 'Bot', value: user.bot ? 'Yes' : 'No', inline: true },
                { name: 'Created At', value: user.createdAt.toLocaleString(), inline: true },
                { name: 'Joined Server At', value: member.joinedAt.toLocaleString(), inline: true },
                { name: 'Roles', value: member.roles.cache.map(role => role.name).join(', ') || 'None', inline: true },
            ],
            footer: {
                text: 'User Info',
                icon_url: interaction.client.user.displayAvatarURL(),
            },
            timestamp: new Date(),
        };

        await interaction.reply({ embeds: [embed] });
    },
};

