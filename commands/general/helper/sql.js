const sqlite3 = require('sqlite3').verbose();

// SQL helper
// // Exposed functions:
// // SQL Write: gets the setting name and value (guildid, setting, value). Writes to /db/settings.db alongside the current guild ID. Returns (setting, newValue)
// // SQL Read: reads specific setting (guildid, setting). Returns (value)
// // SQL ReadAll: reads and returns all settings (guildid)


function sqlWrite(guildid, setting, value) {
    let settings = new sqlite3.Database('./db/settings.db', sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE, (err) => { if (err) { console.error(err.message); }
        console.log('Connected to the settings database.');
    });

    settings.run(`INSERT INTO settings (guildid, ${setting}) VALUES ('${guildid}', 'mhq')`, function(err) {
        if (err) {
            console.error(`INSERT: ${err.message}`);
            }
            
    });

}