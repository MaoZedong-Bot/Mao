const { SlashCommandBuilder } = require(`@discordjs/builders`);
const { EmbedBuilder, ActivityType, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType } = require(`discord.js`);
const simpleGit = require(`simple-git`);
const path = require(`path`);
const { exec } = require(`child_process`);
const fs = require(`fs`);
const logger = require(`../../handler/logger`);

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
                .setName(`log`) // i kept fucking up this line
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
                        ))),
    async execute(interaction) {
        const allowedUserIds = [`1145477822123626596`, `907407245149634571`];
        const notifyUserIds = [`1145477822123626596`, `907407245149634571`]; // tell these people when the bot is updated/restarted

        if (!allowedUserIds.includes(interaction.user.id)){
            await interaction.reply({ content: `You do not have permission to use this command, lmao lol you dont have perms skill issue` });
            return;
        }

        const formatTimestamp = () => {
            const now = new Date();
            const hours = now.getUTCHours().toString().padStart(2, '0');
            const minutes = now.getUTCMinutes().toString().padStart(2, '0');
            const seconds = now.getUTCSeconds().toString().padStart(2, '0');
            return `[${hours}:${minutes}:${seconds} UTC]`; // freakmode: on
        };

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === `update`) {
            await interaction.deferReply({ ephemeral: true });

            const options = [
                new StringSelectMenuOptionBuilder().setLabel(`Cancel`).setValue(`cancel_1`),
                new StringSelectMenuOptionBuilder().setLabel(`Cancel`).setValue(`cancel_2`),
                new StringSelectMenuOptionBuilder().setLabel(`Confirm Update`).setValue(`confirm`),
                new StringSelectMenuOptionBuilder().setLabel(`Cancel`).setValue(`cancel_3`),
                new StringSelectMenuOptionBuilder().setLabel(`Cancel`).setValue(`cancel_4`),
            ];

            // Fisher-Yates shuffle algorithm
            for (let i = options.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [options[i], options[j]] = [options[j], options[i]];
            }

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

                            // Notify specified users
                            for (const userId of notifyUserIds) {
                                const user = await interaction.client.users.fetch(userId);
                                await user.send(`@silent ${formatTimestamp()} The bot has been updated and will restart shortly.`);
                            }

                            // Restart the bot after successful pull
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
                await interaction.followUp({ content: `No crash logs found.`});
                return;
            }

            const errorLogs = logFiles.filter(file => file.includes(`error`));
            if (errorLogs.length === 0) {
                await interaction.followUp({ content: `No error logs found.`});
                return;
            }

            const latestLogFile = errorLogs.sort((a, b) => fs.statSync(path.join(logDir, b)).mtime - fs.statSync(path.join(logDir, a)).mtime)[0];
            const logContent = fs.readFileSync(path.join(logDir, latestLogFile), `utf8`);

            const embed = new EmbedBuilder()
                .setTitle(`Latest Error Log`)
                .setDescription(`\`\`\`${logContent.slice(-2000)}\`\`\``) // Show the last 2000 characters of the log
                .setColor(0xFF0000);

            await interaction.followUp({ embeds: [embed]});
            return;
        }

        if (subcommand === `restart_bot`) {
            await interaction.reply({ content: `Restarting bot...`, ephemeral: false });

            // Notify specified users
            for (const userId of notifyUserIds) {
                const user = await interaction.client.users.fetch(userId);
                await user.send(`@silent ${formatTimestamp()} The bot is being restarted.`);
            }

            exec(`pm2 restart mao`);
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
            return;
        }
    }
};
