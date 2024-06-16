const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');


module.exports = {

	data: new SlashCommandBuilder()
		.setName('warn')
		.setDescription('Warns the selected user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to warn')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Warn reason')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
	async execute(interaction) {
        const { log } = require('./helper/log');
        const { csvWrite } = require('./helper/csvWrite');
        const { generateRandomString } = require('./helper/generateRandomString');

        const target = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        const ident = generateRandomString(10);

        csvWrite('./db/warns.csv', target.id, reason, ident);

        log(interaction, 1, null, target, reason);

        await interaction.reply(`${target} was warned for reason: **${reason}**.`);
        //await console.log(`${target.username} was warned for reason: **${reason}**.`);
	},
};
