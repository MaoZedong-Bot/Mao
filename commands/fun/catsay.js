const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('catsay')
        .setDescription('Cat say')
        .addStringOption(option =>
            option.setName('text')
                .setDescription('What you want the cat to say')
                .setRequired(true)   
        )
        .addStringOption(option => 
            option.setName('color')
                .setDescription('eg., #01bd6a, blue')
                .setRequired(false)
        ),
        async execute(interaction) {
            const text = interaction.options.getString('text');
            const color = interaction.options.getString('color') ?? "#FFF";

            await interaction.reply({
                files: [
                    {
                        attachment: `https://cataas.com/cat/cute/says/${text}?font=Impact&fontSize=75&fontColor=${color}`,
                        name: 'catsay.png',
                    },
                ],
            });
        }
}