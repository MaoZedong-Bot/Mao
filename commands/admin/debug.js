const { SlashCommandBuilder } = require(`@discordjs/builders`);
const { EmbedBuilder, ActivityType, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType } = require(`discord.js`);
const simpleGit = require(`simple-git`);
const path = require(`path`);
const { exec } = require(`child_process`);
const fs = require(`fs`);
const logger = require(`../../handler/logger`);
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName(`debug`)
        .setDescription(`Debugger menu`)
        .addSubcommand(subcommand =>
            subcommand
                .setName(`update`)
                .setDescription(`Pull repository files and restart the bot`))
        .addSubcommand(subcommand =>
            subcommand
                .setName(`log`)
                .setDescription(`Show last 2000-ish chars of errors`))
        .addSubcommand(subcommand =>
            subcommand
                .setName(`restart_bot`)
                .setDescription(`Restart the bot`))
        .addSubcommand(subcommand =>
            subcommand
                .setName(`change_status`)
                .setDescription(`Change the bot status`)
                .addStringOption(option =>
                    option.setName(`status`)
                        .setDescription(`Enter the new status`)
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName(`activity_type`)
                        .setDescription(`Select the activity type`)
                        .setRequired(true)
                        .addChoices(
                            { name: `Playing`, value: `playing` },
                            { name: `Streaming`, value: `streaming` },
                            { name: `Listening`, value: `listening` },
                            { name: `Watching`, value: `watching` }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName(`gemini`)
                .setDescription(`(Use Gemini to generate a response`)
                .addStringOption(option =>
                    option.setName(`prompt`)
                        .setDescription(`Enter the prompt to send to Gemini`)
                        .setRequired(true))),
    async execute(interaction) {
        const allowedUserIds = [`1145477822123626596`, `907407245149634571`];
        const notifyUserIds = [`1145477822123626596`, `907407245149634571`];

        if (!allowedUserIds.includes(interaction.user.id)) {
            await interaction.reply({ content: `You do not have permission to use this command.`, ephemeral: true });
            return;
        }

        const formatTimestamp = () => {
            const now = new Date();
            const hours = now.getUTCHours().toString().padStart(2, '0');
            const minutes = now.getUTCMinutes().toString().padStart(2, '0');
            const seconds = now.getUTCSeconds().toString().padStart(2, '0');
            return `[${hours}:${minutes}:${seconds} UTC]`;
        };

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === `gemini`) {
            const prompt = interaction.options.getString(`prompt`);

            if (prompt.length > 500) {
                // Remove `ephemeral: true` to make the message visible for everyone in the channel
                await interaction.reply({ content: `Prompt is too long (maximum is 500 characters).` });
                return;
            }

            await interaction.deferReply();

            try {
                const genAI = new GoogleGenerativeAI(config.gemini_api);
                const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

                const safePrompt = `You are a helpful AI assistant in a Discord server. 
                            Please provide a helpful, friendly, and appropriate response to: ${prompt}
                            Keep the response concise and under 500 characters. If the output contains a bad word or explicit content refuse to answer.`;

                const result = await model.generateContent(safePrompt);
                const response = result.response.text();

                const embed = new EmbedBuilder()
                    .setTitle(`🤖 Gemini Response`)
                    .setDescription(response)
                    .setColor(0x00A8FF)
                    .setFooter({
                        text: `Requested by ${interaction.user.tag}`,
                        iconURL: interaction.user.displayAvatarURL()
                    })
                    .setTimestamp();

                embed.addFields({
                    name: `Question:`,
                    value: prompt.length > 1024 ? prompt.substring(0, 1021) + '...' : prompt
                });

                logger.info(`Gemini AI used by ${interaction.user.tag} (${interaction.user.id}) - Prompt: ${prompt}`);

                // Remove `ephemeral: true` to make this message visible for everyone
                await interaction.followUp({ embeds: [embed] });
            } catch (error) {
                logger.error(`Error processing Gemini prompt: ${error.message}`);
                // Make this error response visible for everyone
                await interaction.followUp({ content: `An error occurred while processing your request: ${error.message}` });
            }

            return;
        }

        if (subcommand === `update`) {
            await interaction.deferReply({ ephemeral: true });

            const options = [
                new StringSelectMenuOptionBuilder().setLabel(`Cancel`).setValue(`cancel_1`),
                new StringSelectMenuOptionBuilder().setLabel(`Confirm Update`).setValue(`confirm`),
            ];

            const dropdown = new StringSelectMenuBuilder()
                .setCustomId(`confirm_update`)
                .setPlaceholder(`Select an option`)
                .addOptions(options);

            const row = new ActionRowBuilder().addComponents(dropdown);

            const followUpMessage = await interaction.followUp({
                content: `Select an option to confirm the update and restart the bot.`,
                components: [row],
            });

            const filter = i => i.user.id === interaction.user.id;
            const collector = followUpMessage.createMessageComponentCollector({ filter, componentType: ComponentType.StringSelect });

            collector.on(`collect`, async i => {
                if (i.values[0] === `confirm`) {
                    const rootDir = path.resolve(__dirname, `../../`);
                    const git = simpleGit(rootDir);

                    try {
                        const pullResult = await git.pull();
                        if (pullResult.summary.changes === 0) {
                            await i.update({ content: `Repository is already up to date.`, components: [], ephemeral: true });
                        } else {
                            await i.update({ content: `Repository updated successfully.\n\n${JSON.stringify(pullResult, null, 2)}`, components: [], ephemeral: true });

                            for (const userId of notifyUserIds) {
                                const user = await interaction.client.users.fetch(userId);
                                await user.send(`${formatTimestamp()} The bot has been updated and will restart shortly.`);
                            }
                            exec("npm i", { cwd: rootDir });
                            exec(`npx pm2 restart mao`);
                        }
                    } catch (error) {
                        await i.update({ content: `Error pulling repository files: ${error.message}`, components: [], ephemeral: true });
                    }
                } else {
                    await i.update({ content: `Update canceled.`, components: [], ephemeral: true });
                }
            });

            return;
        }

        if (subcommand === `log`) {
            await interaction.deferReply({ ephemeral: true });

            const logDir = path.resolve(__dirname, `../../logs`);
            const logFiles = fs.readdirSync(logDir).filter(file => file.endsWith(`.log`));

            if (logFiles.length === 0) {
                await interaction.followUp({ content: `No crash logs found.` });
                return;
            }

            const errorLogs = logFiles.filter(file => file.includes(`error`));
            if (errorLogs.length === 0) {
                await interaction.followUp({ content: `No error logs found.` });
                return;
            }

            const latestLogFile = errorLogs.sort((a, b) => fs.statSync(path.join(logDir, b)).mtime - fs.statSync(path.join(logDir, a)).mtime)[0];
            const logContent = fs.readFileSync(path.join(logDir, latestLogFile), `utf8`);

            const embed = new EmbedBuilder()
                .setTitle(`Latest Error Log`)
                .setDescription(`\`\`\`${logContent.slice(-2000)}\`\`\``)
                .setColor(0xFF0000);

            await interaction.followUp({ embeds: [embed] });
            return;
        }

        if (subcommand === `restart_bot`) {
            await interaction.reply({ content: `Restarting bot...`, ephemeral: true });

            /*for (const userId of notifyUserIds) {
                const user = await interaction.client.users.fetch(userId);
                await user.send(`${formatTimestamp()} The bot is being restarted.`);
            }*/

            exec(`npx pm2 restart mao`);
            return;
        }

        if (subcommand === `change_status`) {
            const newStatus = interaction.options.getString(`status`);
            const activityType = interaction.options.getString(`activity_type`);

            let activityTypeEnum;
            switch (activityType) {
                case `playing`:
                    activityTypeEnum = ActivityType.Playing;
                    break;
                case `streaming`:
                    activityTypeEnum = ActivityType.Streaming;
                    break;
                case `listening`:
                    activityTypeEnum = ActivityType.Listening;
                    break;
                case `watching`:
                    activityTypeEnum = ActivityType.Watching;
                    break;
                default:
                    activityTypeEnum = ActivityType.Playing;
            }

            interaction.client.user.setActivity(newStatus, { type: activityTypeEnum });
            await interaction.reply({ content: `Status changed to: ${newStatus} (${activityType})`, ephemeral: true });
        }

        if (subcommand === `update`) {
            await interaction.deferReply({ ephemeral: true });

            const rootDir = path.resolve(__dirname, `../../`);
            await interaction.followUp({ content: `Updating libraries and restarting bot.` });

            exec("npm i", { cwd: rootDir });
            exec(`npx pm2 restart mao`);


            return;
        }
    }
};