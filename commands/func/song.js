const { SlashCommandBuilder, EmbedBuilder } = require('discord.js'); 
const fetch = require('node-fetch'); 

const AZURACAST_API_KEY = '6ffbe883ca371f61:56927ff67f695b4d2c3c8371ff0c9484'; 
const AZURACAST_API_URL = 'https://radiopanel.nonameradio.co.uk/api/nowplaying/'; 

module.exports = {
	data: new SlashCommandBuilder() 
		.setName('song') 
		.setDescription('Fetches the current song playing on AzuraCast.'), 
	async execute(interaction) { 
		try {
			// Acknowledge the interaction immediately
			await interaction.deferReply();

			// Fetch the current song from AzuraCast
			const response = await fetch(AZURACAST_API_URL, { 
				headers: { 
					'X-API-Key': AZURACAST_API_KEY
				}
			});

			if (!response.ok) { 
				console.error('Failed to fetch data from AzuraCast:', response.statusText); 
				return interaction.editReply({ content: 'Failed to fetch the current song.' });
			}

			const data = await response.json(); 
			if (!data || data.length === 0) { 
				return interaction.editReply({ content: 'No data received from No Name Radio.' });
			}

			// Assuming you're interested in the first station's current song
			const currentSong = data[0]?.now_playing?.song?.title || 'No song is currently playing'; 
			const currentArtist = data[0]?.now_playing?.song?.artist || 'Unknown Artist'; 
			const currentStreamer = data[0]?.live?.streamer_name || 'NoNameRadio';
			const songArt = data[0]?.now_playing?.song?.art || 'https://app.nonameradio.co.uk/assets/cover.png'; // Default image if no song art available

			// Create an embed
			const embed = new EmbedBuilder()
				.setColor('#9b59b6') // Purple theme
				.setTitle('Now Playing on No Name Radio')
				.addFields(
					{ name: '🎵 Song', value: currentSong, inline: true },
					{ name: '🎤 Artist', value: currentArtist, inline: true },
					{ name: '📻 Presenter', value: currentStreamer, inline: true },
				)
				.setThumbnail(songArt)
				.setFooter({ text: 'No Name Radio', iconURL: 'https://nonameradio.co.uk/assets/images/logoIcon/logo.png' })
				.setURL(`https://kick.com/${currentStreamer}`);

			// Send the embed
			return interaction.editReply({ embeds: [embed] });
		} catch (error) {
			console.error('Error executing command:', error); 
			return interaction.editReply({ content: 'Failed to fetch the current song.' });
		}
	},
};
