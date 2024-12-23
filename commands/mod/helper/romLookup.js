const axios = require('axios');
const cheerio = require('cheerio');

async function getROMVersions(device, romType) {
    const deviceFormatted = device.replace(/ /g, '%20');
    const baseUrl = 'https://xmfirmwareupdater.com';
    const urls = [`${baseUrl}/hyperos/${deviceFormatted}`, `${baseUrl}/miui/${deviceFormatted}`];
    const romVersions = [];

    let response;
    for (const url of urls) {
        try {
            response = await axios.get(url);
            break; // Exit loop if request is successful
        } catch (error) {
            if (error.response && error.response.status === 404) {
                continue; // Try the next URL if 404 error
            } else {
                throw new Error(`An error occurred while fetching ROM data from ${url}: ${error.message}`);
            }
        }
    }

    if (!response) {
        throw new Error('Failed to fetch ROM data from all sources.');
    }

    const html = response.data;
    const $ = cheerio.load(html);

    $('#miui tbody tr').each((index, element) => {
        const tds = $(element).find('td');
        const deviceName = $(tds[0]).text().trim();
        const branch = $(tds[1]).text().trim();
        const type = $(tds[2]).text().trim();
        const rom = $(tds[3]).text().trim();
        const linkElement = $(tds[7]).find('a');
        const downloadLink = linkElement.length ? `${baseUrl}${encodeURI(linkElement.attr('href'))}` : 'No link available';

        if (type.toLowerCase().includes(romType)) {
            const romName = rom.replace(/ (Fastboot|Recovery)$/i, '');
            romVersions.push({ deviceName, branch, romName, downloadLink });
        }
    });

    return romVersions;
}

module.exports = { getROMVersions };
