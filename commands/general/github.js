const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('repo')
        .setDescription('Get information about a GitHub repository from its link or name')
        .addStringOption(option =>
            option.setName('repository')
                .setDescription('The GitHub repository link or name')
                .setRequired(true)),
    async execute(interaction) {
        const repository = interaction.options.getString('repository');
        let owner, repoName;

        if (repository.startsWith('http')) {
            const repoRegex = /github\.com\/([^/]+)\/([^/]+)(?:\/)?$/i;
            const match = repository.match(repoRegex);

            if (!match) {
                return interaction.reply('Invalid GitHub repository link.');
            }

            owner = match[1];
            repoName = match[2];
        } else {
            const parts = repository.split('/');
            if (parts.length !== 2) {
                return interaction.reply('Invalid GitHub repository name.');
            }
            owner = parts[0];
            repoName = parts[1];
        }

        const apiUrl = `https://api.github.com/repos/${owner}/${repoName}`;

        try {
            const response = await axios.get(apiUrl);
            const repoData = response.data;

            const embed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle(repoData.full_name)
                .setURL(repoData.html_url)
                .setDescription(repoData.description || 'No description provided.')
                .setThumbnail(repoData.owner.avatar_url)
                .addFields(
                    { name: 'Stars', value: repoData.stargazers_count.toLocaleString(), inline: true },
                    { name: 'Forks', value: repoData.forks_count.toLocaleString(), inline: true },
                    { name: 'Language', value: repoData.language || 'Not specified', inline: true },
                    { name: 'Owner', value: repoData.owner.login, inline: true },
                    { name: 'Created At', value: new Date(repoData.created_at).toUTCString(), inline: true },
                )
                .setTimestamp();

            interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching repository data:', error);
            interaction.reply('An error occurred while fetching repository data.');
        }
    },
};
