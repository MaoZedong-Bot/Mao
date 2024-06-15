const { REST } = require("@discordjs/rest");
const { Client, Collection, GatewayIntentBits, EmbedBuilder, ActivityType, AttachmentBuilder } = require("discord.js");
const { token } = require('./config.json');
const { Player } = require('discord-player');
const { version } = require('./package.json');
const sqlite3 = require('sqlite3').verbose();

// our handlers
const { loadCommands } = require("./handler/slashCommands");
const { loadEvents } = require("./handler/events");
const { deployCommands } = require("./handler/deployCommands");

const client = new Client({ intents: 46791 });
client.commands = new Collection();

const rest = new REST({ version: "10" }).setToken(token);

// load commands
loadCommands(client);
loadEvents(client);
deployCommands(client);

async function audio(player){
    await player.extractors.loadDefault((ext) => ext == 'YouTubeExtractor');
}

// Audio
const player = new Player(client, {
    skipFFmpeg: false 
});
audio(player);


// holy hell we got SQL
let db = new sqlite3.Database('./db/cat.db', sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the cat database.');
});
const tableName = 'cat';
db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, [tableName], (err, row) => {
    if (err) {
        console.error(err.message);
    }
    if (row) {
        console.log(`Table ${tableName} exists.`)
    } else {
        console.log(`Creating table ${tableName}`)
        db.run(`CREATE TABLE IF NOT EXISTS cat(
            userid TEXT PRIMARY KEY,
            count INTEGER,
            date INTEGER
        )`);
    }
})
db.close();



// startup embed
icon = new AttachmentBuilder(`./images/ccp.png`);
const embed = new EmbedBuilder()
            .setTitle(`Welcome to Mao Zedong v${version}`)
            .setColor('#ff0000')
            .setDescription('Glory to the CCP!')
            .setThumbnail(`attachment://ccp.png`)
            .setFooter({ text: `By UsrBinLuna and CubecatDoesThings` });

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
    //client.user.setPresence({ activities: [{ name: 'Brick Eating Simulator 2024' }] });
    client.user.setActivity('Karma by Jojo Siwa', { type: ActivityType.Listening });

    const channel = client.channels.cache.get('1231228286148018321');
    if (channel) {
        channel.send({ embeds: [embed], files: [icon]  });
    } else {
        console.error('Could not find the specified channel.');
    }

});

player.events.on('playerStart', (queue, track) => {
    // we will later define queue.metadata object while creating the queue
    queue.metadata.channel.send(`Started playing **${track.title}**!`);

});

// discord-player debug
//console.log(player.scanDeps());
player.events.on('debug', (queue, message) => console.log(`[DEBUG ${queue.guild.id}] ${message}`));

// He sees everything
client.login(token);