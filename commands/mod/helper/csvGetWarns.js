const fs = require('fs');
const csv = require('csv-parser');

function csvGetWarns(user) {
  return new Promise((resolve, reject) => {
    const matchingReasons = [];
    const matchingIDs = [];

    // Read from the CSV file
    fs.createReadStream('./db/warns.csv')
      .pipe(csv())
      .on('data', (row) => {
        // Check if the user in the row matches the requested user
        if (row.user === String(user)) {
          matchingReasons.push(row.reason); // Add the reason to the matchingReasons array
          matchingIDs.push(row.id);
        }
        
      })
      .on('end', () => {
        resolve({ matchingReasons, matchingIDs }); // Resolve the promise with matchingReasons once CSV parsing is complete
      })
      .on('error', (error) => {
        reject(error); // Reject the promise if an error occurs during CSV parsing
      });
  });
}

module.exports = {
  csvGetWarns,
};