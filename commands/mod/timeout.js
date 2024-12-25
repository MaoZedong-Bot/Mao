const { SlashCommandBuilder, PermissionFlagsBits, PermissionsBitField } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('timeout')
		.setDescription('Times out the selected user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to timeout')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('unit')
                .setDescription('Unit of time')
                .setRequired(true)
                .addChoices(
                    { name: 'Minutes', value: 'm' },
                    { name: 'Hours', value: 'h' },
                    { name: 'Days', value: 'd' },
                )
        )
        .addIntegerOption(option =>
            option.setName('time')
                .setDescription('Length')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for timeout (optional)')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
	async execute(interaction) {
        const { log } = require('./helper/log');
        const target = interaction.options.getUser('user');
        const targetID = await interaction.guild.members.fetch(target.id);
        const unit = interaction.options.getString('unit');
        const time = interaction.options.getInteger('time');
        const reason = interaction.options.getString('reason') ?? 'No reason provided';

            const bot = interaction.guild.members.me;
    
            if (!bot.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
                return interaction.reply(`I do not have the required permission: \`MuteMembers\``);
            }

        if(targetID.permissions.has(PermissionFlagsBits.ModerateMembers) || targetID.permissions.has(PermissionFlagsBits.Administrator)) {
            await interaction.reply(`You can't timeout moderators!`)
            return;
        }

        if (unit == 'm') {
            const timeoutLength = time * 60 * 1000;
            await targetID.timeout(timeoutLength, reason);
            log(interaction, 2, null, target, reason, `${time}${unit}`);
            await interaction.reply(`${target.username} was timed out for ${time}${unit} for reason: **${reason}**.`);
            await console.log(`${target.username} was timed out for ${time}${unit} for reason: **${reason}**.`);
        } else if (unit == 'h') {
            const timeoutLength = time * 60 * 60 * 1000;
            await targetID.timeout(timeoutLength, reason);
            log(interaction, 2, null, target, reason, `${time}${unit}`);
            await interaction.reply(`${target.username} was timed out for ${time}${unit} for reason: **${reason}**.`);
            await console.log(`${target.username} was timed out for ${time}${unit} for reason: **${reason}**.`);
        } else if (unit == 'd') {
            const timeoutLength = time * 60 * 60 * 24 * 1000;
            await targetID.timeout(timeoutLength, reason);
            log(interaction, 2, null, target, reason, `${time}${unit}`);
            await interaction.reply(`${target.username} was timed out for ${time}${unit} for reason: **${reason}**.`);
            await console.log(`${target.username} was timed out for ${time}${unit} for reason: **${reason}**.`);
        } else {
            await interaction.reply(`Not a valid time unit!`);
        }

	},
};
