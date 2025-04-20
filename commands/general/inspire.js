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
                    content: 'Provide a completely absurd and humorous inspirational quote that sounds like it could be genuine, but makes no sense upon reflection.',
                },
            ],
            keep_alive: -1,
        });

    await interaction.editReply(response.message.content);
    } catch (err) {
    console.error('Error interacting with Ollama:', err);
    await interaction.editReply('An error occurred while generating.');
    }
},
};
