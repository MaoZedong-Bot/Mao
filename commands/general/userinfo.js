const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

const developerUserIds = [
    '1145477822123626596', '907407245149634571'
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Get information about a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to get information about')
                .setRequired(false)),
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;

        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('User Information')
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: 'User ID', value: user.id, inline: true },
                { name: 'Username', value: user.username, inline: true },
                { name: 'Bot', value: user.bot ? 'Yes' : 'No', inline: true },
                { name: 'Created At', value: user.createdAt.toUTCString() },
            )
            .setTimestamp();

        if (developerUserIds.includes(user.id)) {
            embed.setFooter({ text: 'Why are you stalking the developers?' });
        }

        interaction.reply({ embeds: [embed] });
    },
};