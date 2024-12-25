const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeCpuList(query) {
    const url = `https://www.techpowerup.com/cpu-specs/?ajaxsrch=${encodeURIComponent(query)}`;
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

async function scrapeCpuDetails(url) {
    const response = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
        }
    });
    const html = response.data;
    const $ = cheerio.load(html);

    const specs = {};

    $('.sectioncontainer .details').each((index, section) => {
        const category = $(section).find('h1').text().trim();
        specs[category] = {};
        $(section).find('table tbody tr').each((i, row) => {
            const key = $(row).find('th').text().trim();
            const value = $(row).find('td').text().trim();
            if (key && value) {
                specs[category][key] = value;
            }
        });
    });
    return specs;
}

module.exports = { scrapeCpuList, scrapeCpuDetails };