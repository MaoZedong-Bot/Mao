const { REST } = require("@discordjs/rest");
const Discord = require("discord.js");
const client = new Discord.Client({ intents: 32767 });

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setPresence({ activities: [{ name: 'Fuck Kim Jong-Un Simulator' }] });

  const channel = client.channels.cache.get('1231228286148018321');
  if (channel) {
      channel.send('dont mess with me again… 😈 baka… 😈');
      channel.send('Mao Zedong v0.0.69 is running');
  } else {
      console.error('Could not find the specified channel.');
  }
});

client.login(process.env.DISCORD_TOKEN);