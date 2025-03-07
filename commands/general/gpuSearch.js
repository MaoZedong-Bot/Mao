const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeGpuList(query) {
    const url = `https://www.techpowerup.com/gpu-specs/?ajaxsrch=${encodeURIComponent(query)}`;
    const response = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
        }
    });
    const html = response.data;
    const $ = cheerio.load(html);

    const results = [];
    $('table.processors tbody tr').each((index, element) => {
        const name = $(element).find('td:nth-child(1) a').text().trim();
        const link = 'https://www.techpowerup.com' + $(element).find('td:nth-child(1) a').attr('href');
        results.push({ name, link });
    });
    return results;
}

async function scrapeGpuDetails(url) {
    const response = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
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
    return specs;
}

module.exports = { scrapeGpuList, scrapeGpuDetails };
