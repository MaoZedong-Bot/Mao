const { REST } = require("@discordjs/rest");
const { Client, Collection, GatewayIntentBits, EmbedBuilder, ActivityType, AttachmentBuilder } = require("discord.js");
const { token } = require('./config.json');
const { Player } = require('discord-player');
const { version } = require('./package.json');

// our handlers
const { loadCommands } = require("./handler/slashCommands");
const { loadEvents } = require("./handler/events");
const { deployCommands } = require("./handler/deployCommands");
const { loadSql } = require("./handler/loadSql");

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
// this shouldnt work
loadSql();


// startup embed
icon = new AttachmentBuilder(`./images/ccp.png`);
const embed = new EmbedBuilder()
            .setTitle(`Mao Zedong v${version}`)
            .setColor('#ff0000')
            .setDescription('Glory to the CCP!')
            .setThumbnail(`attachment://ccp.png`)
            .setFooter({ text: `By UsrBinLuna and CubecatDoesThings` });

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
    //client.user.setPresence({ activities: [{ name: 'Brick Eating Simulator 2024' }] });
    client.user.setActivity('Karma by Jojo Siwa', { type: ActivityType.Listening });

    const channel = client.channels.cache.get('1089546068565446676');
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