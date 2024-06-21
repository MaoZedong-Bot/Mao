// Here be dragons
const sqlite3 = require('sqlite3').verbose();

function loadSql(){

    // This is for pissrole
    let db = new sqlite3.Database('./db/cat.db', sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the cat database.');
    });
    const tableName = 'cat';

    /* Isnt this supposed to be serialized holy shit */
    db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, [tableName], (err, row) => {
        if (err) {
            console.error(err.message);
        }
        if (row) {
            console.log(`Table ${tableName} exists.`)
        } else {
            console.log(`Creating table ${tableName}`)
            // I don't know what the fuck this does
            db.run(`CREATE TABLE IF NOT EXISTS cat(
                guildid TEXT,
                userid TEXT,
                count INTEGER,
                date INTEGER,
                PRIMARY KEY (guildid, userid)
            )`);
        }
    })
    db.close();

    // Server configuration
    let settings = new sqlite3.Database('./db/settings.db', sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the settings database.');
    });
    const tableName2 = 'settings';

    /* Isnt this supposed to be serialized holy shit */
    settings.get(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, [tableName2], (err, row) => {
        if (err) {
            console.error(err.message);
        }
        if (row) {
            console.log(`Table ${tableName2} exists.`)
        } else {
            console.log(`Creating table ${tableName2}`)
            // I don't know what the fuck this does
            settings.run(`CREATE TABLE IF NOT EXISTS settings(
                guildid TEXT PRIMARY KEY,
                logschannel TEXT,
                logs INTEGER,
                startup INTEGER
            )`);
        }
    })

    /*settings.run(`INSERT INTO settings (guildid, logs) VALUES ('1231228286148018318', 'mhq')`, function(err) {
        if (err) {
            console.error(`INSERT: ${err.message}`);
            }
            
    });*/


    settings.close();
}

module.exports = {
    loadSql,
}