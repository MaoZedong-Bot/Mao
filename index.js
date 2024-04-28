const { REST } = require("@discordjs/rest");
const Discord = require("discord.js");
const client = new Discord.Client({ intents: 32767 });

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setPresence({ activities: [{ name: 'Fuck Kim Jong-Un Simulator' }] });
});

client.login(process.env.DISCORD_TOKEN);