const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('kick')
		.setDescription('Kicks the selected user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to kick')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for kicking (optional)')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
	async execute(interaction) {
        const target = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') ?? 'No reason provided';

        const targetID = await interaction.guild.members.fetch(target.id);
        if(targetID.permissions.has(PermissionFlagsBits.ModerateMembers) || targetID.permissions.has(PermissionFlagsBits.Administrator)) {
            await interaction.reply(`You can't kick moderators!`)
            return;
        }

        await interaction.guild.members.kick(target);
        await interaction.reply(`${target.username} was kicked for reason: **${reason}**.`);
        await console.log(`${target.username} was kicked for reason: **${reason}**.`);
	},
};
