function csvWrite(file, user, reason, id) {
    const fs = require('fs');
    const { parse } = require('json2csv');

    const data = [
        { user: `${user}`, reason: `${reason}`, id: `${id}` },
    ];

    const csvData = parse(data, { header: false })
    fs.appendFile(file, "\n" + csvData, (err) => {
        if (err) throw err;
        console.log('CSV file saved successfully.');
    });
}

module.exports = {
    csvWrite,
};