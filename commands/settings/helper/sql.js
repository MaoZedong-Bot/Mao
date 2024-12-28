const sqlite3 = require('sqlite3').verbose();

// SQL helper
// // Exposed functions:
// // SQL Write: gets the setting name and value (guildid, setting, value). Writes to /db/settings.db alongside the current guild ID. Returns (setting, newValue)
// // SQL Read: reads specific setting (guildid, setting). Returns (value)
// // SQL ReadAll: reads and returns all settings (guildid)


function sqlWrite(guildid, setting, value) {
    let settings = new sqlite3.Database('./db/settings.db', sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE, (err) => { if (err) { logger.error(err.message, '[SQLWrite]'); }
        //logger.info('Connected to the settings database.', '[SQLWrite]');
    });

    const set = `UPDATE settings SET value = ? WHERE guildId = ? AND setting = ?`;

    settings.run(set, [value, guildid, setting], function(err) {
        if (err) {
            return console.error(err.message);
        }
        logger.info(`helper/sql.js: ${this.changes}`, '[SQLWrite]');
    })
}

async function sqlRead(guildid, setting) {

    let settings = new sqlite3.Database('./db/settings.db', sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE, (err) => { if (err) { logger.error(err.message, '[SQLRead]'); }
        //logger.info('Connected to the settings database.', '[SQLRead]');
    });

    let rqValue;
    await new Promise((resolve, reject) => {
        const query = `SELECT value FROM settings WHERE guildid = ? AND setting = ?`;
        settings.get(query, [guildid, setting], (err, row) => {
            if (err) {
                reject(`Error querying the settings database: ${err.message}`);
            } else if (row) {
                rqValue = row.value;
                resolve(row.value);
            } else {
                resolve(null); // No matching record found
            }
        });
    });

    return rqValue;

}

module.exports = {
    sqlWrite,
    sqlRead,
}