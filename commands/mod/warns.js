const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, Embed } = require('discord.js');


module.exports = {

	data: new SlashCommandBuilder()
		.setName('warns')
		.setDescription('List of warns on an user\'s record')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to query')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
	async execute(interaction) {
        const { csvGetWarns } = require('./helper/csvGetWarns');
        const target = interaction.options.getUser('user');
        const targetId = String(target.id);

        const { matchingReasons, matchingIDs } = await csvGetWarns(targetId);
        console.log(targetId);

        const embed = new EmbedBuilder()
            .setTitle(`Warns for ${target.username}`)
            .setColor('#ff0000');
        
        matchingReasons.forEach((reason, index) => {
            embed.addFields({ name: `Warn \`${matchingIDs[index]}\`:`, value: `\`${reason}\`` });
        })

        interaction.reply({ embeds: [embed] });
	},
};
