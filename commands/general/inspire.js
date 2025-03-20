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
            content: 'Generate a completely brain-meltingly stupid inspirational quote about slop, the internet, or literally anything that makes zero sense. Make it sound deep, but upon closer inspection, it should have the intellectual value of a wet sock in a blender. I want it to feel like it was written by a sentient potato having an existential crisis.',
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
