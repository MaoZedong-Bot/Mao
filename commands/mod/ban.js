const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Bans the selected user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to ban')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for banning (optional)')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
	async execute(interaction) {
        const { log } = require('./helper/log');

        const target = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') ?? 'No reason provided';

        const targetID = await interaction.guild.members.fetch(target.id);
        if(targetID.permissions.has(PermissionFlagsBits.ModerateMembers) || targetID.permissions.has(PermissionFlagsBits.Administrator)) {
            await interaction.reply(`You can't ban moderators!`)
            return;
        }

        await interaction.guild.members.ban(target);
        await interaction.reply(`${target.username} was banned for reason: **${reason}**.`);
        log(interaction, 5, null, target, reason, null, null);

        await console.log(`${target.username} was banned for reason: ${reason}.`);
	},
};
