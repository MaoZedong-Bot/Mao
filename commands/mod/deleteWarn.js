const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');


module.exports = {

	data: new SlashCommandBuilder()
		.setName('deletewarn')
		.setDescription('Delete a warn by ID')
        .addStringOption(option =>
                option.setName('id')
                .setDescription('The ID to remove')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
	async execute(interaction) {
        const { csvDeleteWarn } = require('./helper/csvDeleteWarn');

        const target = interaction.options.getString('id');

        csvDeleteWarn(target);

        await interaction.reply(`Warn \`${target}\` was deleted.`);
        await console.log(`Warn ${target} was deleted.`);
	},
};
