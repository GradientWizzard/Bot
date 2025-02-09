const { Events } = require('discord.js');
const fetch = require('node-fetch'); // Import fetch for API calls

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
    console.log('Loading server list which we have been added into to');
    client.guilds.cache.forEach(guild => {
      console.log(guild.name);
    });

    // Function to fetch song and presenter
    async function updateStatus() {
      try {
        const response = await fetch('https://radiopanel.nonameradio.co.uk/api/nowplaying/1');
        const data = await response.json();

        // Ensure the song and presenter are extracted properly
        const songName = data.now_playing.song ? data.now_playing.song.text : 'No song available';
        const presenter = data.now_playing.dj_name && data.now_playing.dj_name !== '' ? data.now_playing.dj_name : 'AutoDJ';  // Fallback to "AutoDJ" if not available


        const statusMessage = `"${songName}" by ${presenter}`;

        // Set the bot's status
        client.user.setPresence({
          status: 'online',
          activities: [
            {
              name: statusMessage,
              type: 2, // 'LISTENING' activity type
            }
          ]
        });
      } catch (error) {
        console.error('Error fetching song or presenter:', error);
      }
    }

    // Update the status initially when the bot is ready
    updateStatus();

    // Optionally, set an interval to update the status periodically (e.g., every 30 seconds)
    setInterval(updateStatus, 30000); // Update every 30 seconds
  },
};
