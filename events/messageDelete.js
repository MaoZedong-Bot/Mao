const { Events } = require('discord.js');


module.exports = {
	name: Events.MessageDelete,


	async execute(interaction) {
        
        console.log(interaction.content);
    }

}