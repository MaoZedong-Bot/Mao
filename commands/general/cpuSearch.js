const axios = require('axios');
const cheerio = require('cheerio');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 86400, checkperiod: 120 });

// Fetches the CPU list based on the query and caches the result
async function scrapeCpuList(query) {
    const cacheKey = `cpu_list:${query}`;
    const cachedResults = cache.get(cacheKey);
    if (cachedResults) {
        console.log('Using cached CPU list for query:', query);
        return cachedResults;
    }

    const url = `https://www.techpowerup.com/cpu-specs/?ajaxsrch=&q=${encodeURIComponent(query)}`;
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.6788.76 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml'
            }
        });
        const html = response.data;
        const $ = cheerio.load(html);

        const results = [];
        $('#list .items-desktop table.items-desktop-table tbody tr').each((i, element) => {
            const name = $(element).find('td:nth-child(1) a').text().trim();
            const href = $(element).find('td:nth-child(1) a').attr('href');
            const link = href ? 'https://www.techpowerup.com' + href : '';
            if (name && link) {
                results.push({ name, link });
            }
        });

        cache.set(cacheKey, results);
        return results;
    } catch (error) {
        console.error('Error scraping CPU list:', error);
        return [];
    }
}

// Fetches the CPU details from a given url and caches the details for future requests
async function scrapeCpuDetails(url) {
    const cacheKey = `cpu_detail:${url}`;
    const cachedDetails = cache.get(cacheKey);
    if (cachedDetails) {
        console.log('Using cached CPU details for URL:', url);
        return cachedDetails;
    }

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.6788.76 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml'
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

        cache.set(cacheKey, specs);
        return specs;
    } catch (error) {
        console.error('Error scraping CPU details:', error);
        return {};
    }
}

// Helper function to fetch details for a list of CPUs concurrently
async function fetchAllCpuDetails(cpuList) {
    const detailPromises = cpuList.map(cpu => scrapeCpuDetails(cpu.link));
    return await Promise.all(detailPromises);
}

module.exports = { scrapeCpuList, scrapeCpuDetails, fetchAllCpuDetails };