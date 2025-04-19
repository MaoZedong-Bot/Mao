const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, EmbedBuilder, AttachmentBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType, InteractionCollector } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });

async function searchGSMArena(query) {
    const cachedResults = cache.get(query);
    if (cachedResults) {
        return cachedResults;
        console.log('Using cached results');
    }
    
    try {
        const url = `https://www.gsmarena.com/results.php3?sQuickSearch=yes&sName=${encodeURIComponent(query)}`;
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.6788.76 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml',
                'Accept-Encoding': 'gzip, deflate, br'
            },
            responseType: 'text'
        });
        
        const $ = cheerio.load(data);
        const results = $('#review-body .makers ul li').map((i, element) => {
            const rawName = $(element).find('strong').html();
            const name = rawName 
                ? rawName.replace(/<br\s*\/?>/gi, ' ')
                         .replace(/<[^>]+>/g, '')
                         .replace(/\s+/g, ' ')
                         .trim() 
                : null;
            const link = $(element).find('a').attr('href');
            const imageUrl = $(element).find('img').attr('src');
            return name && link 
                ? { 
                    name, 
                    link: `https://www.gsmarena.com/${link}`, 
                    imageUrl: imageUrl && imageUrl.startsWith('http') ? imageUrl : `https://www.gsmarena.com/${imageUrl}` 
                  }
                : null;
        }).get();

        cache.set(query, results);
        return results;
    } catch (error) {
        return [];
    }
}

async function parseResults(query) {
    return await searchGSMArena(query);
}

module.exports = {
    parseResults,
};