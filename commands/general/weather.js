const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, Attachment } = require('discord.js');
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
        const locJson = await axios.get(`https://api.maptiler.com/geocoding/${input}.json?key=${maptilerKey}&limit=1`);
        const locJson_parsed = locJson.data;
        let location = "";
        let coordsObj;
        let coords = [];
        let wind = "";
        let icon = "";
        let iconNr = "";

        locJson_parsed.features.forEach(feature => {
            location = feature.place_name;
            coordsObj = feature.geometry.coordinates;

            coords = Object.entries(coordsObj)

        })


        const lon = coords[0][1];
        const lat = coords[1][1];
        const weatherJson = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,wind_direction_10m,weather_code,is_day`);
        const weatherJson_parsed = weatherJson.data;
        const windDirection = weatherJson_parsed.current.wind_direction_10m;
        const weatherCode = weatherJson_parsed.current.weather_code;
        if (windDirection > 338 && windDirection <= 360) {
            wind = "↑";
        } else if (windDirection >= 0 && windDirection <= 22) {
            wind = "↑";
        } else if (windDirection > 22 && windDirection <= 68) {
            wind = "↗";
        } else if (windDirection > 68 && windDirection <= 112) {
            wind = "→";
        } else if (windDirection > 112 && windDirection <= 202) {
            wind = "↓";
        } else if (windDirection > 202 && windDirection <= 248) {
            wind = "↙";
        } else if (windDirection > 248 && windDirection <= 292) {
            wind = "←";
        } else if (windDirection > 292 && windDirection <= 338) {
            wind = "↖";
        } else {
            wind = "";
        }

        if ([0, 1].includes(weatherCode)) {
            iconNr = "01d"
        } else if (weatherCode == 2) {
            iconNr = "02d"
        } else if (weatherCode == 3) {
            iconNr = "03d";
        } else if ([9, 51, 53, 55, 56, 57, 80, 81, 82].includes(weatherCode)) {
            iconNr = "09d";
        } else if ([10, 61, 63, 65, 66, 67].includes(weatherCode)) {
            iconNr = "10d";
        } else if ([13, 75, 77, 85, 86].includes(weatherCode)) {
            iconNr = "13d";
        } else if ([45, 48, 50].includes(weatherCode)) {
            iconNr = "45d";
        } else if ([95, 96, 99].includes(weatherCode)) {
            iconNr = "11d";
        } else {
            iconNr = "NA";
        }

        if (!iconNr == "") {
            icon = new AttachmentBuilder(`./images/${iconNr}.png`);
        }

        const embed = new EmbedBuilder()
            .setTitle(`Weather in ${location}`)
            .setColor(`2222ff`)
            .setThumbnail(`attachment://${iconNr}.png`)
            .setFooter({ text: 'Data from Open-Meteo, weather icon by OpenWeatherMap', iconURL: 'https://raw.githubusercontent.com/open-meteo/open-meteo/main/Public/favicon-32x32.png' });

        embed.addFields({ name: `Temperature:`, value: `${weatherJson_parsed.current.temperature_2m}°C`})
        embed.addFields({ name: `Wind:`, value: `${wind} ${weatherJson_parsed.current.wind_speed_10m}km/h`})

        await interaction.reply({ embeds: [embed], files: [icon] });        
	},
};
