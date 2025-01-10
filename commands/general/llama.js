const { SlashCommandBuilder } = require('discord.js');
const ollama = require('ollama').default; // spent too long figuring this export out

module.exports = {
data: new SlashCommandBuilder()
    .setName('askgemma')
    .setDescription('Ask Gemma a question')
    .addStringOption(option =>
    option.setName('question')
        .setDescription('The question you want to ask')
        .setRequired(true)),
async execute(interaction) {
    const question = interaction.options.getString('question');
    const model = 'gemma2:2b';

    try {
      await interaction.deferReply(); // hi defer the reply
        const response = await ollama.chat({
        model,
        messages: [{ role: 'user', content: question }],
        });

await interaction.editReply(response.message.content);
    } catch (err) {
        console.error('Error interacting with Ollama:', err);
    await interaction.editReply('An error occurred while querying the model.');
    }
},
};
