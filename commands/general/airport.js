const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('airport')
        .setDescription('Find airport by ICAO/FAA code.')
        .addIntegerOption(option =>
            option.setName('codetype')
                .setDescription('Choose between IATA, ICAO.')
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
        } 
        if (codetype == 1 ) {
            code = 'icao'
        }
        
        const url = String('cdn.0000024.xyz')
        const api = String('airport.php')
        const airportJson = await axios.get(`https://${url}/${api}?${code}=${target}`)
        const airport = airportJson.data
        const country = String(airport.iso_country);
        const icao = String(airport.ident);
        const iata = String(airport.iata_code);
        const wikipedia = airport.wikipedia_link;
        const website = airport.home_link;
        const keywords = airport.keywords;

        console.log(airport)

        const lower = country.toLowerCase();
        emoji = `:flag_${lower}:`
        

        const embed = new EmbedBuilder()
            .setTitle(`${airport.name} (${icao}/${iata})`)
            .setColor('#FF5A36');
            embed.addFields(
                { name: 'Location', value: `${airport.municipality}, ${airport.iso_country} ${emoji}`, inline: true },
                { name: 'Continent', value: `${airport.continent}`, inline: true },
                { name: 'Coordinates', value: `Lat: ${airport.latitude_deg}\n Lon: ${airport.longitude_deg}`, inline: true },
                { name: 'Elevation', value: `${airport.elevation_ft} ft`, inline: true } )
        if (wikipedia.length > 0) {
            embed.addFields({ name: 'Wikipedia', value: `[Here](${wikipedia})`, inline: true });
        }
        if (website.length > 0) {
            embed.addFields({ name: 'Website', value: `[Here](${website})`, inline: true });
        }
        if (keywords.length > 0) {
            embed.addFields({ name: 'Keywords', value: `${keywords}`})
        }
            embed.setTimestamp();
            embed.setFooter({ text: `Airport ID: ${airport.id}` });
        
        interaction.reply({ embeds: [embed] });
    },
};
