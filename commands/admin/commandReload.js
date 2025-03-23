const { SlashCommandBuilder, REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Reloads all bot commands.'),

    async execute(interaction) {
        const allowedUserIds = [`1145477822123626596`, `907407245149634571`];

        if (!allowedUserIds.includes(interaction.user.id)) {
            await interaction.reply({ content: `You do not have permission to use this command.`, ephemeral: true });
            return;
        }

        const { clientId, token } = require('../../config.json');
        const { client } = require('../../index');
        const guilds = client.guilds.cache.map(guild => guild.id);
        const logger = require("../../handler/logger");

        try {
            await interaction.deferReply();

            const commands = [];
            const foldersPath = path.join(__dirname, '../../commands');
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
                            client.commands.set(command.data.name, command);
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

            try {
                logger.info(`Started refreshing ${commands.length} application (/) commands.`);

                for (const guildId of guilds) {
                    const data = await rest.put(
                        Routes.applicationGuildCommands(clientId, guildId),
                        { body: commands },
                    );
                    logger.info(`Successfully reloaded ${data.length} commands for guild ${guildId}.`);
                }

                await interaction.editReply(`Successfully reloaded all commands!`);
            } catch (error) {
                logger.error(`Error deploying commands: ${error.message}`);
                await interaction.editReply(`Failed to reload commands: \`${error.message}\``);
            }
        } catch (err) {
            logger.error('Error reloading commands:', err);
            await interaction.editReply('An unexpected error occurred while reloading commands.');
        }
    },
};
