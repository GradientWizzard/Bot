const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const axios = require('axios'); // For API requests
const { defaultStream } = require('../../config.json');
const errorEmbed = require('../../embeds/errorEmbed');
const successEmbed = require('../../embeds/successEmbed');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('connect')
		.setDescription('Connects to the voice channel you are in and plays NoNameRadio.'),
	async execute(interaction) {
		const voiceChannel = interaction.member.voice.channel;

		// Ensure user is in a voice channel
		if (!voiceChannel) {
			return interaction.reply({
				embeds: [errorEmbed('You must be in a voice channel to use this command.')],
			});
		}

		// Check if bot is already in a voice channel
		if (interaction.guild.members.me.voice.channel) {
			return interaction.reply({
				embeds: [errorEmbed('Bot is already in a voice channel. Please disconnect it first.')],
			});
		}

		// Check bot's permissions in the user's channel
		const permissions = voiceChannel.permissionsFor(interaction.guild.members.me);
		if (!permissions.has(PermissionsBitField.Flags.Connect) || !permissions.has(PermissionsBitField.Flags.Speak)) {
			return interaction.reply({
				embeds: [errorEmbed('I don\'t have permission to join or speak in your voice channel.')],
			});
		}

		try {
			// Fetch current song and presenter info from AzuraCast
			const response = await axios.get('https://radiopanel.nonameradio.co.uk/api/nowplaying/1');
			const nowPlaying = response.data.now_playing.song.title;
			const presenter = response.data.live.is_live
				? response.data.live.streamer_name
				: 'AutoDJ';

			// Join the voice channel
			const connection = joinVoiceChannel({
				channelId: voiceChannel.id,
				guildId: interaction.guildId,
				adapterCreator: interaction.guild.voiceAdapterCreator,
			});

			// Create and subscribe an audio player
			const player = createAudioPlayer();
			connection.subscribe(player);

			// Play the default stream
			const resource = createAudioResource(defaultStream);
			player.play(resource);

			// Set an interval to keep the bot active and prevent idle
			const pingInterval = setInterval(() => {
				if (player.state.status === AudioPlayerStatus.Idle) {
					console.log('Player is idle, sending a ping to keep alive.');
					// Play a silent audio or restart the stream to keep it alive
					player.play(createAudioResource(defaultStream)); // You can replace this with a silent audio resource if needed
				}
			}, 30000); // Check every 30 seconds (adjust as needed)

			// Handle player events
			player.on(AudioPlayerStatus.Idle, () => {
				console.log('Player is idle, disconnected from the voice channel.');
				clearInterval(pingInterval); // Stop pinging when the player is idle (optional)
			});

			player.on(AudioPlayerStatus.Playing, () => {
				console.log('Audio is now playing.');
			});

			player.on('error', (error) => {
				console.error('Error in audio player:', error);
				clearInterval(pingInterval); // Stop pinging on error
			});

			// Send success message with current song and presenter
			return interaction.reply({
				embeds: [
					successEmbed(
						'NoNameRadio Connected!',
						`Now playing **${nowPlaying}** by **${presenter}**.`
					),
				],
			});
		} catch (error) {
			console.error('Error fetching now playing data:', error);
			return interaction.reply({
				embeds: [errorEmbed('Failed to fetch the current song or presenter. Try again later.')],
			});
		}
	},
};
