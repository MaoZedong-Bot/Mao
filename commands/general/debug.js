const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { exec } = require('child_process');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('debug')
        .setDescription('Debugger menu')
        .addStringOption(option =>
            option.setName('option')
                .setDescription('Select an option')
                .setRequired(true)
                .addChoices(
                    { name: 'Option 1', value: 'option1' }, //testing shit wip 
                    { name: 'Option 2', value: 'option2' }, //read line 14 (right above this)
                    { name: 'Restart Bot', value: 'restart_bot' }
                )),
    async execute(interaction) {
        const allowedUserIds = ['1145477822123626596', '907407245149634571'];
        const allowedRoleId = '221708385601454081';

        if (!allowedUserIds.includes(interaction.user.id) && !interaction.member.roles.cache.has(allowedRoleId)) {
            await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
            return;
        }

        const selectedOption = interaction.options.getString('option');

        if (selectedOption === 'restart_bot') {
            await interaction.reply({ content: 'Restarting bot...', ephemeral: true });
                exec('pm2 restart 0');
            }

        const embed = new EmbedBuilder()
            .setTitle('Special Command')
            .setDescription(`You selected ${selectedOption}`)
            .setColor(0x00AE86);

        await interaction.reply({ embeds: [embed] });
    }
};
