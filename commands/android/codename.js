const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('codename')
        .setDescription('Find an Android device\'s codename')
        .addStringOption(option =>
            option.setName('brand')
                .setDescription('The device\'s brand')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('device')
                .setDescription('The device to lookup')
                .setRequired(true)
        ),
    async execute(interaction) {
        const brand2 = interaction.options.getString('brand');
        const brand = await brand2.replace(/[&\/\\#,()@$~%.'":*?<>{}`]/g, '');
        const device2 = interaction.options.getString('device');
        const device = await device2.replace(/[&\/\\#,()@$~%.'":*?<>{}`]/g, '');
        const url = 'https://raw.githubusercontent.com/androidtrackers/certified-android-devices/master/by_brand.json';
        let counter = 0;

        try {
            const json = await axios.get(`${url}`);
            const jsonData = json.data;

            const lowerCaseKeys = Object.keys(jsonData).reduce((acc, key) => {
                acc[key.toLowerCase()] = key;
                return acc;
            }, {});

            const brandJson = jsonData[lowerCaseKeys[`${brand}`.toLowerCase()]];
            if (!brandJson) {
                await interaction.reply({ content: `No data found for brand!`, ephemeral: false });
                return;
            }

            const deviceJson = brandJson
                .filter(item => item.name.toLowerCase().includes(device.toLowerCase()))
                .map(item => ({ name: item.name, device: item.device }));

            const uniqueDevices = deviceJson
                .map(({ name, device }) => ({ name, device }))
                .filter((value, index, self) => self.findIndex(item => item.name === value.name && item.device === value.device) === index);

            if (uniqueDevices.length === 0) {
                await interaction.reply({ content: `No codenames found!`, ephemeral: false });
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle(`Codename(s) for '${brand} ${device}'`)
                .setColor('#2eb237');

            uniqueDevices.forEach(item => {
                if (counter < 25) {
                    embed.addFields({ name: item.name, value: item.device, inline: true });
                    counter++;
                }
            });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching codenames:', error);
            await interaction.reply({ content: 'An error occurred while fetching the codenames. Please try again later.', ephemeral: true });
        }
    },
};
