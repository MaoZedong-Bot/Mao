const { REST } = require("@discordjs/rest");
const { Client, Collection, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const { token } = require('./config.json');

const fs = require("fs");
const path = require('node:path');

// our handlers
const { loadCommands } = require("./handler/slashCommands");
const { loadEvents } = require("./handler/events");
const { deployCommands } = require("./handler/deployCommands");

const client = new Client({ intents: 32767 });
client.commands = new Collection();

const rest = new REST({ version: "10" }).setToken(token);


// load commands
loadCommands(client);
loadEvents(client);
deployCommands(client);

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setPresence({ activities: [{ name: 'Brick Eating Simulator 2024' }] });

    const channel = client.channels.cache.get('1231228286148018321');
    if (channel) {
        channel.send('dont mess with me again… 😈 baka… 😈');
        channel.send('# It\'s either Spanish or Vanish, <@1145477822123626596>.');
    } else {
        console.error('Could not find the specified channel.');
    }
});

client.login(token);