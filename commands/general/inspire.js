const { SlashCommandBuilder } = require('discord.js');
const ollama = require('ollama').default;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inspire')
        .setDescription('Generates a completely absurd inspirational quote')
        .addStringOption(option =>
            option
                .setName('model')
                .setDescription('Choose the model to use')
                .setRequired(true)
                .addChoices(
                    { name: 'Llama 3.2: 1B', value: 'llama3.2:1b' },
                    { name: 'Gemma 3 1B', value: 'gemma3:1b' }
                )
        ),
    async execute(interaction) {
        const model = interaction.options.getString('model');

        try {
            await interaction.deferReply();

            const response = await ollama.chat({
                model,
                keep_alive: -1, // Keeps the prompt in memory/RAM
                messages: [
                    {
                        role: 'user',
                        content: 'generate a single crazy absurd inspirational quote',
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