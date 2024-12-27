const axios = require('axios');
const cheerio = require('cheerio');


async function scrapeSocList(query) {
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
    const url = `https://phonedb.net/index.php?m=processor&s=list`;
    var bodyFormData = new URLSearchParams();
    await bodyFormData.append('search_exp', query);
    await bodyFormData.append('search_header', '');

    const response = await axios({
        method: "post",
        "rejectUnauthorized": false,
        url: "http://phonedb.net/index.php?m=processor&s=list",
        params: bodyFormData,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' },
    });


    const html = response.data;
    const $ = cheerio.load(html);

    const results = [];
    $('.content_block_title a').each((index, element) => {
        const title = $(element).attr('title');
        const name = title.replace('  ', ' ');
        const href = $(element).attr('href');
        const link = "http://phonedb.net/" + href;
        results.push({ name, link });
    });
    return results;
}


async function scrapeSoCDetails(url) {
    const response = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
        }
    });
    const html = response.data;
    const $ = cheerio.load(html);

    const specs = [];

    $('table tbody tr').each((index, row) => {
        const label = $(row).find('td:first-child strong').text().trim(); // Label
        const value = $(row).find('td:last-child').text().trim(); // Value

        if (label && value) {
            specs.push({ label, value });
        }
    });
    return specs;
}

async function getSocImage(url) {
    const response = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
        }
    });
    const html = response.data;
    const $ = cheerio.load(html);

    const imgElement = $('div.sidebar img');

    if (imgElement) {
        const src = imgElement.attr('src');
        const img = `https://phonedb.net/${src}`;
        return img;
    } else {
        return null;
    }
}

module.exports = {
    scrapeSocList,
    scrapeSoCDetails,
    getSocImage,
}