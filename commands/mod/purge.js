const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('purge')
		.setDescription('Deletes messages')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Messages')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
	async execute(interaction) {
        const amount = interaction.options.getInteger('amount');

        if (amount <= 0 || amount > 100) {
            return interaction.reply('You can only delete between 1 and 100 messages at a time.');
        }
        
        try {
            const fetched = await interaction.channel.messages.fetch({ limit: amount });
            await interaction.channel.bulkDelete(fetched);
            interaction.reply(`Deleted ${fetched.size} messages.`);
        } catch (error) {
            console.error('Error deleting messages:', error);
            interaction.reply('An error occurred while deleting messages.');
        }
	},
};
