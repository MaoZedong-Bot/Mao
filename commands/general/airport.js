const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');


module.exports = {

	data: new SlashCommandBuilder()
		.setName('airport')
		.setDescription('Find airport by ICAO/FAA code')
        .addStringOption(option =>
            option.setName('airport')
                .setDescription('The airport to query')
                .setRequired(true)
        ),
	async execute(interaction) {
        const { csvGetICAO } = require('./helper/csvGetICAO');
        const target = interaction.options.getString('airport');
        let emoji = "";

        const { matchingAirport, municipality, country } = await csvGetICAO(target);


        const lower = await country[0].toLowerCase();
        emoji = `:flag_${lower}:`
        

        const embed = new EmbedBuilder()
            .setTitle(`${matchingAirport[0]} (${target})`)
            .setDescription(`${municipality[0]}, ${country[0]} ${emoji}`)
            .setColor('#ddddff');
        
        interaction.reply({ embeds: [embed] });
	},
};
