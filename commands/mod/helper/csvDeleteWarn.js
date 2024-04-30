const fs = require('fs');
const csv = require('csv-parser');
const { parse } = require('json2csv');

async function csvDeleteWarn(idToRemove) {
    const data = await new Promise((resolve, reject) => {
        const dataArray = [];
        fs.createReadStream('./db/warns.csv')
            .pipe(csv())
            .on('data', (row) => {
            dataArray.push(row);
            })
            .on('end', () => {
                resolve(dataArray);
            })
            .on('error', (error) => {
                reject(error);
            });
    });

    const updatedData = data.filter((row) => row.id !== idToRemove);
    const csvData = parse(updatedData);

    fs.writeFile('./db/warns.csv', csvData, (err) => {
        if (err) {
            console.error('Error writing to CSV file:', err);
            return;
        }
    console.log('Warn removed successfully.');
    });
}

module.exports = {
    csvDeleteWarn,
};