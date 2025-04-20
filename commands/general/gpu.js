const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType, EmbedBuilder } = require('discord.js');
const { scrapeGpuList, scrapeGpuDetails } = require('./gpuSearch');

function formatGpuDetails(specs, includeFields) {
    let description = '';
    const excludeFields = [
        'Suggested PSU', 'Memory Bandwidth', 'Transistors', 'Density', 'Foundry', 'GPU Variant', 'Bandwidth', 'Process Size', 'Process Type', 'Slot Width', 'Outputs', 'Length', 'Width', 'Height', 'Power Connectors', 'Board Number'
    ];

    // Ladies and gentlemen, the most convoluted way to move a field from one category to another
    if (specs['Board Design']) {
        if (specs['Board Design']['TDP']) {
            if (!specs['Graphics Processor']) {
                specs['Graphics Processor'] = {};
            }
            specs['Graphics Processor']['TDP'] = specs['Board Design']['TDP'];
        }
        delete specs['Board Design'];
    }

    for (const [category, details] of Object.entries(specs)) {
        if (includeFields.includes(category)) {
            description += `**${category}**\n`;
            for (const [key, value] of Object.entries(details)) {
                if (!excludeFields.includes(key) && !value.includes('Gbps effective')) {
                    description += `**${key}:** ${value}\n`;
                }
            }
            description += '\n';
        }
    }

    return description.trim();
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gpu')
        .setDescription('Scrapes GPU specs from TechPowerUp')
        .addStringOption(option => 
            option.setName('query')
                .setDescription('The GPU to search for')
                .setRequired(true)),
    async execute(interaction) {
        const query2 = interaction.options.getString('query');
        const query = query2.replace(/[&\/\\#,()@$~%.'":*?<>{}`]/g, '');
        await interaction.deferReply();

        const results = await scrapeGpuList(query);

        if (results.length === 0) {
            await interaction.editReply('No results found.');
            return;
        }

        if (results.length === 1) {
            const specs = await scrapeGpuDetails(results[0].link);

            if (specs) {
                const embed = new EmbedBuilder()
                    .setTitle(results[0].name)
                    .setURL(results[0].link)
                    .setColor(0x00AE86)
                    .setDescription(formatGpuDetails(specs, ['Graphics Processor', 'Clock Speeds', 'Memory', 'Render Config']))
                    .setFooter({ text: 'Powered by TechPowerUp' });

                await interaction.editReply({
                    components: [],
                    embeds: [embed],
                    content: '',
                });
            } else {
                await interaction.editReply('Error fetching GPU details.');
            }

            return;
        }

        const dropdown = new StringSelectMenuBuilder()
            .setCustomId(interaction.id)
            .setPlaceholder('Select a GPU');

        results.slice(0, 25).forEach(result => {
            dropdown.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(result.name)
                    .setValue(result.link)
            );
        });

        const row = new ActionRowBuilder().addComponents(dropdown);

        const reply = await interaction.editReply({
            content: 'Choose a GPU',
            components: [row],
        });

        const collector = reply.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            filter: (i) => i.user.id === interaction.user.id && i.customId === interaction.id,
            time: 30_000,
        });

        collector.on('collect', async (selectInteraction) => {
            const selectedUrl = selectInteraction.values[0];
            const specs = await scrapeGpuDetails(selectedUrl);
            const selectedName = results.find(result => result.link === selectedUrl).name;

            if (specs) {
                const embed = new EmbedBuilder()
                    .setTitle(selectedName)
                    .setURL(selectedUrl)
                    .setColor(0x00AE86)
                    .setDescription(formatGpuDetails(specs, ['Graphics Processor', 'Clock Speeds', 'Memory', 'Render Config']))
                    .setFooter({ text: 'Powered by TechPowerUp' });

                await selectInteraction.update({
                    components: [],
                    embeds: [embed],
                    content: '',
                });
            } else {
                await selectInteraction.update({
                    components: [],
                    content: 'Error fetching GPU details.',
                });
            }
        });
    },
};
