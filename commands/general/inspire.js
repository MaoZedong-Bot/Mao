const { SlashCommandBuilder } = require('discord.js');
const ollama = require('ollama').default;

module.exports = {
data: new SlashCommandBuilder()
    .setName('inspire')
    .setDescription('Generates a completely absurd inspirational quote'),
async execute(interaction) {
    const model = 'llama3.2:1b';

    try {
      await interaction.deferReply(); // defer the reply :blush:

    const response = await ollama.chat({
        model,
        messages: [
        {
            role: 'user',
            content: 'generate a single completely absurd inspirational quote about slop and the internet',
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
