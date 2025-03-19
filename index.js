const { REST } = require("@discordjs/rest");
const { Client, Collection, GatewayIntentBits, EmbedBuilder, ActivityType, AttachmentBuilder } = require("discord.js");
const { Player } = require('discord-player');
const { YoutubeiExtractor } = require('discord-player-youtubei');
const axios = require('axios');
const fs = require('node:fs');

const { token } = require('./config.json');
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

// Logging
const logger = require("./handler/logger")

async function audio(player){
    await player.extractors.loadDefault((ext) => ext == 'YouTubeExtractor' || ext == 'AttachmentExtractor');
}

// Audio
const player = new Player(client, {
    skipFFmpeg: false,
    streamType: 'raw',
    disableFilters: true,
    disableResampler: true
});
player.extractors.register(YoutubeiExtractor, {})
audio(player);

// check for updates on startup
async function checkForUpdates(){
    const url = String('api.github.com');
    const api = String('repos/MaoZedong-Bot/Mao/commits/main');
    const commitJson = await axios.get(`https://${url}/${api}`);
    const commitData = commitJson.data;
    const commit = commitData.sha;
    return commit.slice(0,7);;
}


async function setupEmbed() {
    const remoteCommit = await checkForUpdates();

    let localCommit = await fs.readFileSync('.git/refs/heads/main', 'utf8');

    icon = new AttachmentBuilder(`./images/ccp.png`);
    const embed = new EmbedBuilder()
        .setTitle(`Mao Zedong \`${version}\``)
        .setColor('#ff0000')
        .setThumbnail(`attachment://ccp.png`)
        .setFooter({ text: `By UsrBinLuna and warp32767` });

    if (remoteCommit == localCommit.slice(0,7)) {
        embed.setDescription(`Glory to the CCP!\n\n**Mao Zedong is up to date!**\nLocal Version: \`${localCommit.slice(0,7)}\`\nLatest Version: \`${remoteCommit}\``);
    } else {
        embed.setDescription(`Glory to the CCP!\n\n**Please Update to Latest Version**\nLocal Version: \`${localCommit.slice(0,7)}\`\nLatest Version: \`${remoteCommit}\``);
    }

    const channelId = '342053200746250243';

    const channel = client.channels.cache.get(channelId);
    if (channel) {
        channel.send({ embeds: [embed], files: [icon] });
    } else {
        logger.error(`Could not find the specified channel: ${channelId}`);
    }
}


let guildIds = [];

client.on("ready", async () => {
    logger.info(`Logged in as ${client.user.tag}!`);
    client.user.setActivity('Rest in peace Xi Her', { type: ActivityType.Watching });

    await setupEmbed();

    guildIds = await client.guilds.cache.map(guild => guild.id);
    logger.info(`Connected to guilds: ${guildIds}`)

    await deployCommands(client, guildIds);

    await guildIds.forEach(guildid => {
        loadSql(guildid);
    })

    //channel.send(String(`Guilds: ${guildIds}`));

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

module.exports = { guildIds, client };