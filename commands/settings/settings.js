const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('Configure the bot')
        .addSubcommand(subcommand =>
            subcommand
                .setName('logstoggle')
                .setDescription('Toggle logging')
                .addBooleanOption(option =>
                    option.setName('enabled')
                        .setDescription('Toggle logging')
                        .setRequired(true)
                )

        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('logschannel')
                .setDescription('Logs channel')
                .addChannelOption(option =>
                    option.setName('id')
                        .setDescription('Logs channel')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand 
                .setName('pissrole')
                .setDescription('Piss role')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('Piss role')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand 
                .setName('threshold')
                .setDescription('Threshold for piss role')
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('Threshold amount')
                        .setRequired(true)
                )
        ),
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const enabled = interaction.options.getBoolean('enabled') ?? 0;
        const id = interaction.options.getChannel('id') ?? 0;
        const role = interaction.options.getRole('role') ?? 0;
        console.log(role.id)

        const { sqlWrite } = require('./helper/sql')

        switch (interaction.options.getSubcommand()) {

            case 'logstoggle':
                sqlWrite(interaction.guild.id, 'logs', enabled);
                await interaction.reply(`Logs channel is now ${enabled}`);
                break;

            case 'logschannel':
                sqlWrite(interaction.guild.id, 'logschannel', id.id);
                await interaction.reply(`Logs channel is now ${id}`);
                break;

            case 'pissrole':
                sqlWrite(interaction.guild.id, 'pissrole', role.id);
                await interaction.reply(`Piss role is now ${role}`);
                break;

            case 'threshold':
                const threshold = interaction.options.getInteger('amount');
                sqlWrite(interaction.guild.id, 'threshold', threshold)
                await interaction.reply(`Piss role threshold is now ${threshold}`);
                break;

            default:
                await interaction.reply('Achievement get: *How did we get here?*');

        }

        
    }

}