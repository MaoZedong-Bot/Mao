const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');

async function searchGSMArena(query) {
    try {
        const url = `https://www.gsmarena.com/results.php3?sQuickSearch=yes&sName=${encodeURIComponent(query)}`;
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
            }
        });
        const $ = cheerio.load(data);

        const results = [];
        $('#review-body .makers ul li').each((i, element) => {
            const name = $(element).find('strong span').text().trim();
            const link = $(element).find('a').attr('href');
            const imageUrl = $(element).find('img').attr('src');
            if (name && link) {
                results.push({
                    name,
                    link: `https://www.gsmarena.com/${link}`,
                    imageUrl
                });
            }
        });

        return results;
    } catch (error) {
        console.error('Error searching GSMArena:', error);
        return [];
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('Searches for phones on GSMArena')
        .addStringOption(option => 
            option.setName('query')
                .setDescription('The search query')
                .setRequired(true)),
    async execute(interaction) {
        const query = interaction.options.getString('query');
        await interaction.deferReply();

        try {
            const results = await searchGSMArena(query);
            if (results.length > 0) {
                const embed = new EmbedBuilder()
                    .setTitle(`Search results for "${query}"`)
                    .setColor(0x00AE86);

                results.forEach(result => {
                    embed.addFields({ name: result.name, value: `[Link](${result.link})`, inline: true });
                    if (result.imageUrl) {
                        embed.setThumbnail(result.imageUrl);
                    }
                });

                await interaction.editReply({ embeds: [embed] });
            } else {
                await interaction.editReply(`No results found for "${query}".`);
            }
        } catch (error) {
            console.error('Error executing command:', error);
            await interaction.editReply('An error occurred while searching GSMArena.');
        }
    },
};