const { SlashCommandBuilder } = require('@discordjs/builders'); 
const { CommandInteraction } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder() 
		.setName('avatar') 
		.setDescription('Displays the avatar of the specified user or your own avatar.') 
		.addUserOption(option =>
			option.setName('user') 
				.setDescription('The user to get the avatar of') 
				.setRequired(false)
			),
    
    /** * Executes the command. 
* @param {CommandInteraction} 
     interaction - The interaction object. */
	async execute(interaction) { 
		const user = 
        interaction.options.getUser('user') || interaction.user; 
	await interaction.reply({
		content: `${user.username}'s avatar:`, 
		embeds: [{ 
			image: { url: user.displayAvatarURL({ dynamic: true, size: 512 }) },
			color: 0x0099ff
            }]
        });
    },
};
