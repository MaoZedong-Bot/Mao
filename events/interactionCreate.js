const { Events } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,


	async execute(interaction) {

		const { buttonIdHandler } = require('./helper/buttonIdHandler');
		const logger = require("../handler/logger");

		if (interaction.isChatInputCommand()){

			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				logger.error(`No command matching '${interaction.commandName}' was found.`);
				await interaction.reply({ content: `No command matching '${interaction.commandName}' was found.`, ephemeral: true });
				return;
			}

			try {
				await command.execute(interaction);
			} catch (error) {
				logger.error(error);
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
				} else {
					await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
				}
			}
		} else if (interaction.isButton()) {
			// Permanent button menus
			buttonIdHandler(interaction.customId, interaction.message)
		} 
	},
};
