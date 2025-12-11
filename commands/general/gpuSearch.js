const axios = require('axios');
const cheerio = require('cheerio');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 86400, checkperiod: 120 });

async function scrapeGpuList(query) {
    const cacheKey = `gpu_list:${query}`;
    const cachedResults = cache.get(cacheKey);
    if (cachedResults) {
        console.log('Using cached GPU list for query:', query);
        return cachedResults;
    }

    const url = `https://www.techpowerup.com/gpu-specs/?q=${encodeURIComponent(query)}`;
    const response = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.6788.76 Safari/537.36'
        }
    });
    const html = response.data;
    const $ = cheerio.load(html);

    const results = [];
    $('table.items-desktop-table tbody tr').each((index, element) => {
        const nameElem = $(element).find('td .item-title .item-name a');
        const name = nameElem.text().trim();
        const href = nameElem.attr('href');
        const link = href ? `https://www.techpowerup.com${href}` : null;

        // Only add if name and link exist
        if (name && link) {
            results.push({ name, link });
        }
    });

    cache.set(cacheKey, results);
    return results;
}

async function scrapeGpuDetails(url) {
    const cacheKey = `gpu_detail:${url}`;
    const cachedDetails = cache.get(cacheKey);
    if (cachedDetails) {
        console.log('Using cached GPU details for URL:', url);
        return cachedDetails;
    }

    const response = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.6788.76 Safari/537.36'
        }
    });
    const html = response.data;
    const $ = cheerio.load(html);

    const specs = {};
    $('.sectioncontainer .details').each((index, section) => {
        const category = $(section).find('h2').text().trim();
        specs[category] = {};
        $(section).find('dl').each((i, row) => {
            const key = $(row).find('dt').text().trim();
            const value = $(row).find('dd').text().trim();
            if (key && value) {
                specs[category][key] = value;
            }
        });
    });

    cache.set(cacheKey, specs);
    return specs;
}

module.exports = { scrapeGpuList, scrapeGpuDetails };
