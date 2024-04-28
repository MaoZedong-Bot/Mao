const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unban')
		.setDescription('Unbans the selected user')
        .addStringOption(option =>
            option.setName('userid')
                .setDescription('The user ID to unban')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
	async execute(interaction) {
        const target = interaction.options.getString('userid');

        function isInteger(value) {
            return /^\d+$/.test(value);
        }

        if (isInteger(target) == true) {
            await interaction.guild.members.unban(target);
            await interaction.reply(`${target} was **unbanned**.`);
            await console.log(`${target} was unbanned.`);
        } else {
            await interaction.reply(`Provided value is not an integer or valid user ID`);
        }
	},
};
