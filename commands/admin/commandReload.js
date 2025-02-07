const { SlashCommandBuilder, REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Lorem ipsum dolor sit amet'),
async execute(interaction) {

    const allowedUserIds = [`1145477822123626596`, `907407245149634571`];

    if (!allowedUserIds.includes(interaction.user.id)){
        await interaction.reply({ content: `You do not have permission to use this command.`, ephemeral: true });
        return;
    }

    const { clientId, token } = require('../../config.json');
    const { client } = require('../../index');
    const guilds = await client.guilds.cache.map(guild => guild.id);

    const logger = require("../../handler/logger");

    try {
        await interaction.deferReply(); // defer the reply :blush:

        const commands = [];
        const foldersPath = path.join(__dirname, '../../commands');
        const commandFolders = fs.readdirSync(foldersPath);

        for (const folder of commandFolders) {
            const commandsPath = path.join(foldersPath, folder);
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                const command = require(filePath);
                if ('data' in command && 'execute' in command) {
                    commands.push(command.data.toJSON());
                } else {
                    logger.warning(`The command at ${filePath} is missing a required "data" or "execute" property.`);
                }
            }
        }

        const rest = new REST().setToken(token);

        let data;

        (async () => {
            try {
                logger.info(`Started refreshing ${commands.length} application (/) commands.`);

                guilds.forEach(guildid => {
                    data = rest.put(
                        Routes.applicationGuildCommands(clientId, guildid),
                        { body: commands },
                    );
                })

                logger.info(`Successfully reloaded ${data.length} application (/) commands.`);
                await interaction.editReply(`Successfully reloaded ${data.length} application (/) commands.`);
            } catch (error) {
                logger.error(error);
            }
        })();

    } catch (err) {
        logger.error('Error reloading commands:', err);
        await interaction.editReply('An error occurred while reloading commands.');
    }
},
};
