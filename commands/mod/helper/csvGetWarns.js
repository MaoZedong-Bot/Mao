const fs = require('fs');
const csv = require('csv-parser');

function csvGetWarns(user) {
  return new Promise((resolve, reject) => {
    const matchingReasons = [];
    const matchingIDs = [];

    fs.createReadStream('./db/warns.csv')
      .pipe(csv())
      .on('data', (row) => {
        if (row.user === String(user)) {
          matchingReasons.push(row.reason); 
          matchingIDs.push(row.id);
        }
        
      })
      .on('end', () => {
        resolve({ matchingReasons, matchingIDs }); 
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

module.exports = {
  csvGetWarns,
};