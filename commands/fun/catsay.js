const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('catsay')
        .setDescription('Cat say')
        .addStringOption(option =>
            option.setName('text')
                .setDescription('What you want the cat to say')
                .setRequired(true)
        ),
    
        async execute(interaction) {
            const text = interaction.options.getString('text');

            await interaction.reply({
                files: [
                    {
                        attachment: `https://cataas.com/cat/cute/says/${text}?font=Impact&fontSize=75`,
                        name: 'catsay.png',
                    },
                ],
            });
        }
}