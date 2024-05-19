const axios = require('axios');
const cheerio = require('cheerio');

async function getROMVersions(device, romType) {
    const deviceFormatted = device.replace(/ /g, '%20');
    const miuiUrl = `https://xiaomifirmwareupdater.com/miui/${deviceFormatted}`;
    const hyperosUrl = `https://xiaomifirmwareupdater.com/hyperos/${deviceFormatted}`;

    let response;
    let html;
    let romVersions = [];

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

    const tableRows = $('#miui tbody tr');
    tableRows.each((index, element) => {
        const tds = $(element).find('td');
        const deviceName = $(tds[0]).text();
        const branch = $(tds[1]).text();
        const type = $(tds[2]).text();
        const rom = $(tds[3]).text();

        if (type.toLowerCase().includes(romType)) {
            const romName = rom.replace(/ (Fastboot|Recovery)$/i, '');
            romVersions.push({ deviceName, branch, romName });
        }
    });

    return romVersions;
}

module.exports = { getROMVersions };
