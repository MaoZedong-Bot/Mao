const axios = require('axios');
const cheerio = require('cheerio');

async function getROMVersions(device, romType) {
    const deviceFormatted = device.replace(/ /g, '%20');

    const baseUrl = 'https://xmfirmwareupdater.com';
    const miuiUrl = `${baseUrl}/miui/${deviceFormatted}`;
    const hyperosUrl = `${baseUrl}/hyperos/${deviceFormatted}`;

    let response;
    let html;
    const romVersions = [];

    try {
        response = await axios.get(hyperosUrl);
    } catch (hyperosError) {
        if (hyperosError.response && hyperosError.response.status === 404) {
            response = await axios.get(miuiUrl);
        } else {
            throw new Error('An error occurred while fetching ROM data.');
        }
    }

    html = response.data;
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
