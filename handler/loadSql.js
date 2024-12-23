const sqlite3 = require('sqlite3').verbose();

function checkAndInsertDefaults(settings, guildid, defaultSettings, tableName) {
    return new Promise((resolve, reject) => {
        settings.serialize(() => {

            settings.get(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, [tableName], (err, row) => {
                if (err) {
                    console.error(err.message);
                }
                if (row) {
                    console.log(`Table settings exists.`);
                } else {
                    console.log(`Creating table settings`);
                    settings.run(`CREATE TABLE IF NOT EXISTS settings(
                        guildid TEXT,
                        setting TEXT,
                        value TEXT,
                        PRIMARY KEY (guildid, setting)
                    )`);
                }
            });


            settings.get(`SELECT guildid FROM settings WHERE guildid = ?`, [guildid], (err, row) => {
                if (err) {
                    return reject(err);
                }
                if (row) {
                    console.log(`Guild ${guildid} already exists.`);
                    resolve();
                } else {
                    console.log(`Guild ${guildid} does not exist. Adding with default settings.`);

                    const insertStmt = settings.prepare(`INSERT INTO settings (guildid, setting, value) VALUES (?, ?, ?)`);
                    for (const { setting, value } of defaultSettings) {
                        insertStmt.run([guildid, setting, value], (err) => {
                            if (err) {
                                return reject(err);
                            }
                        });
                    }
                    insertStmt.finalize((err) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve();
                    });
                }
            });
        });
    });
}


async function loadSql(guildid) {
    // This is for pissrole
    let db = new sqlite3.Database('./db/cat.db', sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Connected to the cat database.');
        }
    });

    const tableName = 'cat';
    db.serialize(() => {
        db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, [tableName], (err, row) => {
            if (err) {
                console.error(err.message);
            }
            if (row) {
                console.log(`Table ${tableName} exists.`);
            } else {
                console.log(`Creating table ${tableName}`);
                db.run(`CREATE TABLE IF NOT EXISTS cat(
                    guildid TEXT,
                    userid TEXT,
                    count INTEGER,
                    date INTEGER,
                    PRIMARY KEY (guildid, userid)
                )`);
            }
        });
    });

    // Server configuration
    let settings = new sqlite3.Database('./db/settings.db', sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(`error loading settings db: ${err.message}`);
        } else {
            console.log('Connected to the settings database.');
        }
    });


    
    const defaultSettings = [
        { setting: 'logs', value: '0' },
        { setting: 'logschannel', value: '0' },
        { setting: 'pissrole', value: '0' },
        // Add more default settings as needed
    ];

    const tableName2 = 'settings';

    // TODO: fix this bs
    try {
        await checkAndInsertDefaults(settings, guildid, defaultSettings, tableName2);
    } catch (err) {
        console.error(`Error inserting default settings: ${err.message}`);
    }
    //


    settings.close((err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Closed the settings database connection.');
        }
    });

    db.close((err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Closed the cat database connection.');
        }
    });
}

module.exports = {
    loadSql,
};