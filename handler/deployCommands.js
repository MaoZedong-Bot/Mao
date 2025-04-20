function deployCommands(client, guilds) {
    const { REST, Routes } = require('discord.js');
    const { clientId, token } = require('../config.json');
    const fs = require('node:fs');
    const path = require('node:path');
    const logger = require("./logger");

    const commands = [];
    const foldersPath = path.join(__dirname, '../commands');
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);

            delete require.cache[require.resolve(filePath)];

            try {
                const command = require(filePath);
                if ('data' in command && 'execute' in command) {
                    commands.push(command.data.toJSON());
                } else {
                    logger.warning(`The command at ${filePath} is missing a required "data" or "execute" property.`);
                }
            } catch (error) {
                logger.error(`Error loading command ${filePath}: ${error.message}`);
            }
        }
    }

    const rest = new REST().setToken(token);

    (async () => {
        try {
            logger.info(`Started refreshing ${commands.length} application (/) commands.`);

            for (const guildId of guilds) {
                const data = await rest.put(
                    Routes.applicationGuildCommands(clientId, guildId),
                    { body: commands },
                );
                logger.info(`Successfully reloaded ${data.length} application (/) commands for guild ${guildId}.`);
            }
        } catch (error) {
            logger.error(`Failed to reload commands: ${error.message}`);
        }
    })();
}

module.exports = {
    deployCommands,
};
