const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const { maptilerKey } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('weather')
		.setDescription('Find weather at a location')
        .addStringOption(option =>
            option.setName('location')
                .setDescription('Place')
                .setRequired(true)
        ),
	async execute(interaction) {
        const input = interaction.options.getString('location');

        // geocoding
        const locJson = await axios.get(`https://api.maptiler.com/geocoding/${input}.json?key=${maptilerKey}&types=country,region,subregion,county,municipality&limit=1`);
        const locJson_parsed = locJson.data;
        let location = "";
        locJson_parsed.features.forEach(feature => {
            location = feature.place_name;
            console.log(location);
        })

        await axios.get(`https://wttr.in/${location}?Td&format=%l:+%c%t;+Wind+%w`)
            .then((res) => interaction.reply(String(res.data)))
            .catch((err) => interaction.reply(String(err)));
	},
};
