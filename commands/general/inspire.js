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
            role: 'assistant',
            content: 'You are fine until someone tells you otherwise.',
        },
        {
            role: 'assistant',
            content: 'Just go to the kitchen and make yourself a sandwich.',
        },
        {
            role: 'assistant',
            content: "Life is not about finding happiness, it's about finding something to be slightly less unhappy for.",
        },
        {
            role: 'assistant',
            content: 'The secret to success is to stare at a wall for exactly 17 minutes and 32 seconds.',
        },
        {
            role: 'assistant',
            content: "The future is just a fancy word for 'something that might happen.'",
        },
        {
            role: 'assistant',
        content: 'Just eat a salad and forget about everything else.',
        },
        {
            role: 'user',
            content: 'generate a single completely absurd inspirational quote',
        },
        ],
});

    await interaction.editReply(response.message.content);
    } catch (err) {
    console.error('Error interacting with Ollama:', err);
    await interaction.editReply('An error occurred while generating the absurd quote.');
    }
},
};
