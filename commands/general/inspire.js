const { SlashCommandBuilder } = require('discord.js');
const ollama = require('ollama').default;

module.exports = {
data: new SlashCommandBuilder()
    .setName('inspire')
    .setDescription('Generates a completely absurd inspirational quote'),
async execute(interaction) {
    const model = 'tinyllama';

    try {
      await interaction.deferReply(); // defer the reply :blush:

    const response = await ollama.chat({
        model,
        messages: [
        {
            role: 'user',
            content: 'generate a single completely absurd made up inspirational quote',
        },
        ],
});

    await interaction.editReply(response.message.content);
    } catch (err) {
    console.error('Error interacting with Ollama:', err);
    await interaction.editReply('An error occurred while generating.');
    }
},
};
