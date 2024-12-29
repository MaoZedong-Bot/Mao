const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, Attachment } = require('discord.js');
const axios = require('axios');
const fs = require('node:fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('update')
		.setDescription('Check for updates'),
	async execute(interaction) {
        async function checkForUpdates(){
            const url = String('api.github.com');
            const api = String('repos/MaoZedong-Bot/Mao/commits/main');
            const commitJson = await axios.get(`https://${url}/${api}`);
            const commitData = commitJson.data;
            const commit = commitData.sha;
            return commit.slice(0,7);;
        }
        
        
        const remoteCommit = await checkForUpdates();
    
        let localCommit = await fs.readFileSync('.git/refs/heads/main', 'utf8'); 
        console.log(`l: ${localCommit}`)
        console.log(`r: ${remoteCommit}`)
    
        if (remoteCommit == localCommit.slice(0,7)) {
            const embed = new EmbedBuilder()
                .setTitle('Mao Zedong is up to date!')
                .setDescription(`Local Version: \`${localCommit.slice(0,7)}\`\nLatest Version: \`${remoteCommit}\``)
                .setColor('#ff0000');
            
            await interaction.reply({ embeds: [embed] });
        } else if (remoteCommit != localCommit.slice(0,7)) {
            const embed = new EmbedBuilder()
                .setTitle('Update required!')
                .setDescription(`Local Version: \`${localCommit.slice(0,7)}\`\nLatest Version: \`${remoteCommit}\``)
                .setColor('#ff0000');
            
            await interaction.reply({ embeds: [embed] });
        } else {
            await interaction.reply('something fucked up REAL bad')
        }
	},
};
