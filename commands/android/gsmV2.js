const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');

async function scrapePhoneSpecs(url) {
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
            }
        });
        const $ = cheerio.load(data);

        const specs = {};

        specs.name = $('h1.specs-phone-name-title').text().trim();
        specs.imageUrl = $('div.specs-photo-main img').attr('src');

        const specCategories = [
            'Network', 'Launch', 'Body', 'Display', 'Platform', 'Memory', 'Main Camera', 'Selfie camera', 'Sound', 'Comms', 'Features', 'Battery', 'Misc'
        ];

        specCategories.forEach(category => {
            specs[category] = {};
            $(`th:contains(${category})`).closest('table').find('tr').each((i, element) => {
                const key = $(element).find('td.ttl').text().trim();
                const value = $(element).find('td.nfo').text().trim();
                if (key && value) {
                    specs[category][key] = value;
                }
            });
        });

        return specs;
    } catch (error) {
        console.error('Error scraping phone specs:', error);
        return null;
    }
}

function formatDescription(specs, excludeFields) {
    let description = '';

    for (const [category, details] of Object.entries(specs)) {
        if (category !== 'name' && category !== 'imageUrl') {
            if (category === 'Main Camera' || category === 'Selfie camera') {
                description += `**${category.replace(' camera', ' Camera')}:**\n`;
            }
            for (const [key, value] of Object.entries(details)) {
                if (!excludeFields.includes(key)) {
                    description += `**${key}:** ${value}\n`;
                }
            }
        }
    }

    return description;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('scrape')
        .setDescription('Scrapes phone specs from GSMArena')
        .addStringOption(option => 
            option.setName('url')
                .setDescription('The URL of the phone specs page on GSMArena')
                .setRequired(true)),
    async execute(interaction) {
        const url = interaction.options.getString('url');
        await interaction.deferReply();

        try {
            const specs = await scrapePhoneSpecs(url);
            if (specs) {
                const embed = new EmbedBuilder()
                    .setTitle(specs.name)
                    .setURL(url)
                    .setColor(0x00AE86)
                    .setThumbnail(specs.imageUrl);

                const excludeFields = ['2G bands', '3G bands', '4G bands', '5G bands', 'Speed', 'CPU', 'GPU', 'NFC', 'Price', 'Video', 'Loudspeaker', '3.5mm jack', 'Radio', 'SAR', 'SAR EU', 'WLAN', 'Positioning', 'SIM', 'Card slot', 'Charging', 'Sensors', 'Announced'];

                const description = formatDescription(specs, excludeFields);
                embed.setDescription(description);

                await interaction.editReply({ embeds: [embed] });
            } else {
                await interaction.editReply('Failed to scrape phone specs.');
            }
        } catch (error) {
            console.error('Error executing command:', error);
            await interaction.editReply('An error occurred while scraping phone specs.');
        }
    },
};