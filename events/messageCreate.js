const { Events } = require('discord.js');

module.exports = {
	name: Events.MessageCreate,


	async execute(interaction) {
                
                const { autoModeration } = require('./helper/automod');

                const message = interaction.content;
                if (interaction.author.bot) return;
                autoModeration(message, interaction);

	},

};
