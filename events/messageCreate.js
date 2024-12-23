const { Events } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

module.exports = {
	name: Events.MessageCreate,


	async execute(interaction) {
        
        const { autoModeration } = require('./helper/automod');

        const { sqlRead } = require('../commands/settings/helper/sql');

        if (interaction.author.bot) return;

        const message = interaction.content;
        const member = await interaction.guild.members.fetch(interaction.author.id);
        const roleId = await sqlRead(interaction.guild.id, 'pissrole');
        const threshold = await sqlRead(interaction.guild.id, 'threshold');
        const role = await interaction.guild.roles.cache.get(roleId);
        
        autoModeration(message, interaction);

        if (roleId == 0) {
            // TODO: better way to handle this
            return;
        }

        async function updateMessageCount(interaction, role, threshold) {
            const db = new sqlite3.Database('./db/cat.db', sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE, (err) => {
                if (err) {
                console.error(err.message);
                }
            });

            const currentUNIX = Math.floor(Date.now() / 1000);

            try {
                await new Promise((resolve, reject) => {
                    db.serialize(() => {
                        // Check if the user exists
                        db.get(`SELECT count, date FROM cat WHERE userid = ?`, [interaction.author.id], (err, row) => {
                            if (err) {
                                console.error(`GET: ${err.message}`);
                                interaction.channel.send(err.message);
                                return reject(err);
                            }
                
                            if (row) {
                                const initialUNIX = row.date;
                                const count = row.count;
                    
                                if (currentUNIX - initialUNIX >= 2592000) {
                                    // More than 30 days have passed, reset count and set new date
                                    db.run(`UPDATE cat SET count = 1, date = ? WHERE userid = ?`, [currentUNIX, interaction.author.id], function(err) {
                                    if (err) {
                                        console.error(`RESET: ${err.message}`);
                                        return reject(err);
                                    }
                                    console.log(`Count reset and date updated for user: ${interaction.author.id}`);
                                    if (member.roles.cache.has(role.id)) {
                                        member.roles.remove(role);
                                    }
                                    resolve();
                                    });
                                } else if (count >= threshold && currentUNIX - initialUNIX < 2592000) {
                                    //console.log(`User ${interaction.author.id} has sent over 1000 messages in the past 30 days!`);
                                    db.run(`UPDATE cat SET count = count + 1 WHERE userid = ?`, [interaction.author.id], function(err) {
                                        if (err) {
                                            console.error(`INCREMENT: ${err.message}`);
                                            return reject(err);
                                        }
                                        //console.log(`Row(s) updated: ${this.changes}`);
                                    });
                                    if (member.roles.cache.has(role.id)) {
                                        return;
                                    } else {
                                        member.roles.add(role);
                                        interaction.channel.send(`Congratulations! **<@${interaction.author.id}>** has now become piss.`);
                                    }
                                    resolve();
                                } else {
                                    // Increment the count
                                    db.run(`UPDATE cat SET count = count + 1 WHERE userid = ?`, [interaction.author.id], function(err) {
                                    if (err) {
                                        console.error(`INCREMENT: ${err.message}`);
                                        return reject(err);
                                    }
                                    //console.log(`Row(s) updated: ${this.changes}`);
                                    resolve();
                                    });
                                }
                            } else {
                                // User does not exist, insert new record with the current timestamp
                                db.run(`INSERT INTO cat (guildid, userid, count, date) VALUES (?, ?, ?, ?)`, [interaction.guild.id, interaction.author.id, 1, currentUNIX], function(err) {
                                    if (err) {
                                    console.error(`INSERT: ${err.message}`);
                                    return reject(err);
                                    }
                                    //console.log(`Row(s) inserted: ${this.lastID}`);
                                    resolve();
                                });
                            }
                        });
                    });
                });

            } catch (error) {
                console.error('An error occurred:', error);
            } finally {
                db.close((err) => {
                    if (err) {
                        console.error(err.message);
                    } else {
                        console.log('Closed the database connection.');
                    }
                });
            }

        }

        updateMessageCount(interaction, role, threshold);

    }

}