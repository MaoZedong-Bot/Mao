const sqlite3 = require('sqlite3').verbose();

function checkAndInsertDefaults(settings, guildid, defaultSettings, tableName) {

    const logger = require("./logger");

    return new Promise((resolve, reject) => {
        settings.serialize(() => {

            settings.get(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, [tableName], (err, row) => {
                if (err) {
                    logger.error(err.message, '[SQL]');
                }
                if (row) {
                    logger.info(`Table settings exists.`, '[SQL]');
                } else {
                    logger.info(`Creating table settings`, '[SQL]');
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
                    logger.info(`Guild ${guildid} already exists.`, '[SQL]');
                    resolve();
                } else {
                    logger.info(`Guild ${guildid} does not exist. Adding with default settings.`, '[SQL]');

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

    const logger = await require("./logger");

    // This is for pissrole
    let db = new sqlite3.Database('./db/cat.db', sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            logger.error(err.message, 'SQL');
        } else {
            logger.info('Connected to the cat database.', '[SQL]');
        }
    });

    const tableName = 'cat';
    db.serialize(() => {
        db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, [tableName], (err, row) => {
            if (err) {
                logger.error(err.message, '[SQL]');
            }
            if (row) {
                logger.info(`Table ${tableName} exists.`, '[SQL]');
            } else {
                logger.info(`Creating table ${tableName}`, '[SQL]');
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
            logger.error(`error loading settings db: ${err.message}`, '[SQL]');
        } else {
            logger.info('Connected to the settings database.', '[SQL]');
        }
    });


    
    const defaultSettings = [
        { setting: 'logs', value: '0' },
        { setting: 'logschannel', value: '0' },
        { setting: 'pissrole', value: '0' },
        { setting: 'threshold', value: '1000' },
    ];

    const tableName2 = 'settings';

    // TODO: fix this bs
    try {
        await checkAndInsertDefaults(settings, guildid, defaultSettings, tableName2);
    } catch (err) {
        logger.error(`Error inserting default settings: ${err.message}`, '[SQL]');
    }
    //


    settings.close((err) => {
        if (err) {
            logger.error(err.message, '[SQL]');
        } else {
            logger.info('Closed the settings database connection.', '[SQL]');
        }
    });

    db.close((err) => {
        if (err) {
            logger.error(err.message, '[SQL]');
        } else {
            logger.info('Closed the cat database connection.', '[SQL]');
        }
    });
}

module.exports = {
    loadSql,
};