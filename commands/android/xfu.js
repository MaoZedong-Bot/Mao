const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getROMVersions } = require('../mod/helper/romLookup');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('miui')
        .setDescription('Get MIUI or HyperOS versions for a device using codename as input')
        .addStringOption(option =>
            option.setName('device')
                .setDescription('Device codename')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('rom_type')
                .setDescription('Choose ROM type')
                .setRequired(true)
                .addChoices(
                    { name: 'Fastboot', value: 'fastboot' },
                    { name: 'Recovery', value: 'recovery' },
                )),
    async execute(interaction) {
        try {
            const device = interaction.options.getString('device');
            const romType = interaction.options.getString('rom_type');

            const romVersions = await getROMVersions(device, romType);

            const romTypeTitle = romType.charAt(0).toUpperCase() + romType.slice(1);
            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`${romTypeTitle} ROM Versions for ${device}`)
                .setFooter({text: 'Info from xiaomifirmwareupdater.com', iconURL: 'https://xiaomifirmwareupdater.com/images/xfu.png'})
                .addFields(
                    romVersions.map(({ deviceName, branch, romName }) => ({
                        name: `${deviceName} ${branch}`,
                        value: romName
                    }))
                )

            interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error executing command:', error);
            interaction.reply('Device lookup failed!');
        }
    },
};
