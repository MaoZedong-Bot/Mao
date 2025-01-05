const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('milk')
        .setDescription('Milks someone')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user you want to milk')
                .setRequired(true)
        ),
    async execute(interaction) {
        if (interaction.options.getUser('user') === interaction.user) {
            return interaction.reply({ content: 'You cannot milk yourself :(', ephemeral: true }); // dont milk yourself kids
        } else {
            return interaction.reply(`${interaction.user} milked ${interaction.options.getUser('user')} :milk:`)
        }
    },
};

// slop