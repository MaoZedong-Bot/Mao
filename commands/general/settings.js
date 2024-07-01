const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('Bot Settings')
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('Set a flag')
                .addStringOption(option =>
                    option.setName('setting')
                        .setDescription('Choose ROM type')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Logs', value: 'logs' },
                            { name: 'Logs Channel', value: 'logschannel' },
                        )
        ))
        .addSubcommand(subcommand =>
            subcommand
                .setName('get')
                .setDescription('Get settings')
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        console.log("fuck");
    }

}