const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const mysql = require('mysql2/promise');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('book')
        .setDescription('Add a new event')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Event name')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('day')
                .setDescription('Day of the week')
                .setRequired(true)
                .addChoices(
                    { name: 'Monday', value: 'Monday' },
                    { name: 'Tuesday', value: 'Tuesday' },
                    { name: 'Wednesday', value: 'Wednesday' },
                    { name: 'Thursday', value: 'Thursday' },
                    { name: 'Friday', value: 'Friday' },
                    { name: 'Saturday', value: 'Saturday' },
                    { name: 'Sunday', value: 'Sunday' }
                ))
        .addStringOption(option =>
            option.setName('start')
                .setDescription('Start time (HH:MM)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('end')
                .setDescription('End time (HH:MM)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('image')
                .setDescription('Image name (optional)')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('permaslot')
                .setDescription('Is this a permanent slot?')
                .setRequired(false)),

    async execute(interaction) {
        const name = interaction.options.getString('name');
        const day = interaction.options.getString('day');
        const start = interaction.options.getString('start');
        const end = interaction.options.getString('end');
        const image = interaction.options.getString('image') || 'default_image.png';
        const permaslot = interaction.options.getBoolean('permaslot') ? 1 : 0;

        // Database connection details
        const dbConfig = {
            host: 'nonameradio.co.uk',
            user: 'hiddenninja_radioupdate',
            password: 'HcGap~Xen8Ov',
            database: 'hiddenninja_radioupdate'
        };

        try {
            const connection = await mysql.createConnection(dbConfig);

            // Check for overlapping events
            const [overlap] = await connection.execute(
                `SELECT COUNT(*) as count 
                 FROM events 
                 WHERE day = ? 
                 AND (
                     (? < end AND ? > start) OR
                     (? >= start AND ? < end) OR
                     (? < start AND ? >= end)
                 )`,
                [day, start, end, start, end, start, end]
            );

            if (overlap[0].count > 0) {
                await interaction.reply({ content: 'Error: The selected time slot overlaps with an existing booking.', ephemeral: true });
                return;
            }

            // Insert the event into the database
            await connection.execute(
                `INSERT INTO events (name, day, start, end, image, permaslot) VALUES (?, ?, ?, ?, ?, ?)`,
                [name, day, start, end, image, permaslot]
            );

            // Close the database connection
            await connection.end();

            // Notify Discord webhooks
            const webhooks = [
                'https://discord.com/api/webhooks/1267855855374565376/H2tsWvMm-XzQ4ir6JwYByr0dFie513bEBtTpnfezeMBfiVfqPiseBjY4wD7ajL152w2D',
                'https://discord.com/api/webhooks/1318177305180372992/w3EnValBPXZoBZymUOaAY-WJzb7koBykfeZKGSAkS6DJtbNJ10woOtmqQL0_8Coi5TcK'
            ];

            const embed = new EmbedBuilder()
                .setTitle('New Event Added')
                .addFields(
                    { name: 'Event Name', value: name },
                    { name: 'Day', value: day },
                    { name: 'Time Slot', value: `${start} - ${end}` },
                    { name: 'Permanent Slot', value: permaslot ? 'Yes' : 'No' }
                )
                .setColor(0x00AE86)
                .setFooter({ text: 'Event Booking System' });

            for (const webhook of webhooks) {
                await fetch(webhook, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ embeds: [embed.toJSON()] })
                });
            }

            await interaction.reply({ content: 'Event added successfully, and notifications have been sent!', ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'An error occurred while adding the event. Please try again later.', ephemeral: true });
        }
    }
};
