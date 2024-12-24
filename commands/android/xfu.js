const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getROMVersions } = require('../mod/helper/romLookup');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('latest')
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


            if (romVersions.length === 0) {
                return interaction.reply(`No ${romType} ROMs found for ${device}.`);
            }

            const romTypeTitle = romType.charAt(0).toUpperCase() + romType.slice(1);

            // Group ROM versions by deviceName and branch
            const groupedVersions = romVersions.reduce((acc, { deviceName, branch, romName, downloadLink }) => {
                const key = `${deviceName} ${branch}`;
                if (!acc[key]) {
                    acc[key] = [];
                }
                acc[key].push({ romName, downloadLink });
                return acc;
            }, {});

            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`${romTypeTitle} ROM Versions for ${device}`)
                .setFooter({ text: 'Info from xmfirmwareupdater.com', iconURL: 'https://xmfirmwareupdater.com/images/xfu.png' });

            // Add fields to embed
            for (const [key, versions] of Object.entries(groupedVersions)) {
                const value = versions.map(({ romName, downloadLink }) => `\`${romName}\`\n[Download](${downloadLink})`).join('\n\n');
                embed.addFields({ name: key, value, inline: true });
            }

            interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error executing command:', error);
            interaction.reply('Device lookup failed!');
        }
    },
};
