const { SlashCommandBuilder } = require('discord.js'); module.exports = 
{
    data: new SlashCommandBuilder() .setName('tags') 
        .setDescription('Receive notifications on changes, updates, announcements and live music'),
    async execute(interaction) {
        // Define the role name that you want to toggle
        const roleName = 'Tags';
        // Get the member who executed the command
        const member = interaction.member;
        // Find the role in the guild by name
        const role = interaction.guild.roles.cache.find(r => r.name === 
        roleName); if (!role) {
            return interaction.reply({ content: `Role "${roleName}" not 
            found!`, ephemeral: true });
        }
        // Check if the member already has the role
        if (member.roles.cache.has(role.id)) {
            // Remove the role if the user has it
            await member.roles.remove(role); await interaction.reply({ 
            content: `The "${roleName}" role has been removed from you.`, ephemeral: true });
        } else {
            // Add the role if the user doesn't have it
            await member.roles.add(role); await interaction.reply({ 
            content: `You have been given the "${roleName}" role!`, 
            ephemeral: true });
        }
    },
};
