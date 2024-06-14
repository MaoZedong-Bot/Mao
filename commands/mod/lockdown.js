const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lockdown')
		.setDescription('Lockdown settings')
        .addSubcommand(subcommand =>
            subcommand
                .setName('start')
                .setDescription('Start the lockdown')
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for lockdown')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('end')
                .setDescription('End the lockdown')
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
        const reason = interaction.options.getString('reason') ?? 'No reason provided';
        const guild = interaction.guild;

        const channels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildText);
        let channelList = [];

        if (interaction.options.getSubcommand() === 'start') {
            channels.forEach(async (channel) => {
                channelList.push(channel.id);
                await channel.permissionOverwrites.edit(guild.roles.everyone, {
                    SendMessages: false,
                });
            });
            await interaction.reply(`**Lockdown Started:** ${reason}`);
        } else if (interaction.options.getSubcommand() === 'end') {
            channels.forEach(async (channel) => {
                channelList.push(channel.id);
                await channel.permissionOverwrites.edit(guild.roles.everyone, {
                    SendMessages: true,
                });
            });
            await interaction.reply(`**Lockdown Ended**`);
        } else {
            return;
        }

	},
};
