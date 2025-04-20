const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purgeuser')
        .setDescription('Deletes messages from a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Messages')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('from')
                .setDescription('Delete messages from...')
                .setRequired(true)
                .addChoices(
                    { name: 'All Channels', value: 'a' },
                    { name: 'This Channel', value: 't' },
                )
        )
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Amount of messages to delete per channel (max 100)')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction) {
        await interaction.deferReply();
        const user = interaction.options.getUser('user');
        const userID = user.id
        const from = interaction.options.getString('from');
        const amount = interaction.options.getInteger('amount');

        const guild = interaction.guild;
        if (!guild) {
            return interaction.reply({ content: 'Could not retrieve guild.', ephemeral: false });
        }

        const botMember = await guild.members.fetchMe();

        const channels = guild.channels.cache
            .filter(channel =>
                channel.type === ChannelType.GuildText &&
                channel.permissionsFor(botMember)?.has(PermissionsBitField.Flags.ViewChannel) // ❌ safe check
            )
            .map(channel => channel.id);

        if (amount <= 0 || amount > 100) {
            return interaction.followUp('You can only delete between 1 and 100 messages at a time.');
        }

        let totalDeleted = 0;

        if (from === 'a') {
            channels.forEach(async channel => {
                try {
                    console.log(channel)
                    const channelBody = await guild.channels.fetch(channel);
                    const messages = await channelBody.messages.fetch({ limit: 100 });
                    const userMessages = await messages
                        .filter(msg => msg.author.id === userID)
                        .first(amount);

                    if (userMessages.length > 0) {
                        await channelBody.bulkDelete(userMessages, true);
                        totalDeleted += userMessages.length;
                    }
                } catch (error) {
                    console.error(`Failed to delete messages in #${channel.name}:`, error);
                    await interaction.followUp(`Failed to delete messages in #${channel.name}:`, error);

                }
            }, this);
            await interaction.followUp(`Deleted ${totalDeleted} messages from ${user.tag} in all channels.`);

        } else if (from === 't') {
            const channelID = interaction.channel.id;
            const channel = await guild.channels.fetch(channelID);
            try {
                const messages = await channel.messages.fetch({ limit: 100 });

                const userMessages = messages
                    .filter(msg => msg.author.id === userID)
                    .first(amount);

                if (userMessages.length > 0) {
                    await channel.bulkDelete(userMessages, true);
                    totalDeleted += userMessages.length;
                }

                await interaction.followUp(`Deleted ${totalDeleted} messages from ${user.tag} in #${channel.name}.`);

            } catch (error) {
                console.error(`Failed to delete messages in #${channel.name}:`, error);
                await interaction.followUp(`Failed to delete messages in #${channel.name}:`, error);
            }
        }

    },
};
