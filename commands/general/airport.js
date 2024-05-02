const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {

	data: new SlashCommandBuilder()
		.setName('airport')
		.setDescription('Find airport by ICAO/FAA code')
        .addIntegerOption(option =>
            option.setName('codetype')
                .setDescription('Choose between IATA or ICAO')
                .setRequired(true)
                .addChoices(
                    { name: 'IATA', value: 0 },
                    { name: 'ICAO', value: 1 },
                )
        )
        .addStringOption(option =>
            option.setName('airport')
                .setDescription('The airport to query')
                .setRequired(true)
        ),
	async execute(interaction) {

        
        const target = interaction.options.getString('airport');
        const codetype = interaction.options.getInteger('codetype');
        let code;
        if (codetype == 0) {
            code = 'iata';
        } else {
            code = 'icao'
        }

        const airportJson = await axios.get(`https://www.airport-data.com/api/ap_info.json?${code}=${target}`)
        const airport = airportJson.data
        const country = String(airport.country_code);
        const icao = String(airport.icao);
        const iata = String(airport.iata);

        console.log(airport)

        const lower = country.toLowerCase();
        emoji = `:flag_${lower}:`
        

        const embed = new EmbedBuilder()
            .setTitle(`${airport.name} (${icao}/${iata})`)
            .setDescription(`${airport.location}, ${airport.country} ${emoji}`)
            .setColor('#ddddff');
        
        interaction.reply({ embeds: [embed] });
	},
};
