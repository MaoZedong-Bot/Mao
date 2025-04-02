const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bugs')
        .setDescription('whatsap'),
    async execute(interaction) {
        try {
            await interaction.reply('IN YOUR PHONE📱📲📲📲BUGS ‼️🪲‼️🪲🪲🚫URGENTLY‼️DELETE🚫📲📲WHATSAP🚫IN YOUR PHONE📱📲📲📲BUGS ‼️🪲‼️🪲🪲🚫URGENTLY‼️DELETE🚫📲📲WHATSAP🚫');
        } catch (err) {
            console.error('Error sending the custom message:', err);
            await interaction.reply('An error occurred while trying to reply.');
        }
    },
};