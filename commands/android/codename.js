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
        const brand = interaction.options.getString('brand');
        const device = interaction.options.getString('device');
        const url = 'https://raw.githubusercontent.com/androidtrackers/certified-android-devices/master/by_brand.json';

        const json = await axios.get(`${url}`);
        const jsonData = json.data;

        const lowerCaseKeys = Object.keys(jsonData).reduce((acc, key) => {
            acc[key.toLowerCase()] = key;
            return acc;
        }, {});

        brandJson = jsonData[lowerCaseKeys[`${brand}`.toLowerCase()]]
        const deviceJson = brandJson
            .filter(item => item.name.toLowerCase().includes(device.toLowerCase())) // Filter items with 'name' containing the search term
            .map(item => ({ name: item.name, device: item.device }));

        const uniqueDevices = deviceJson
            .map(({ name, device }) => ({ name, device })) // Extract 'name' and 'device' properties into a new object
            .filter((value, index, self) => self.findIndex(item => item.name === value.name && item.device === value.device) === index);
        
        console.log(uniqueDevices);

        const embed = new EmbedBuilder()
            .setTitle(`Codename(s) for \'${brand} ${device}\'`)
            .setColor('#2eb237');

        uniqueDevices.forEach(item => {
            embed.addFields({ name: item.name, value: `\`${item.device}\``});
        });


        interaction.reply({ embeds: [embed] });
	},
};
