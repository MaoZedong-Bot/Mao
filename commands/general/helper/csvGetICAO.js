const fs = require('fs');
const csv = require('csv-parser');

function csvGetICAO(icao) {
  return new Promise((resolve, reject) => {
    const matchingAirport = [];
    const municipality = [];
    const country = [];


    fs.createReadStream('./db/airports.csv')
      .pipe(csv())
      .on('data', (row) => {
        if (row.ident === String(icao)) {
          matchingAirport.push(row.name);
          municipality.push(row.municipality);
          country.push(row.iso_country);
        }
        
      })
      .on('end', () => {
        resolve({ matchingAirport, municipality, country }); 
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

module.exports = {
  csvGetICAO,
};