const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, EmbedBuilder, AttachmentBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType, InteractionCollector } = require('discord.js');

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
            const name = $(element).find('strong span').html().replace(/<br>/g, ' ').trim();
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

async function parseResults(query) {
    const results = await searchGSMArena(query);
    return results;
}

module.exports = {
    parseResults,
}