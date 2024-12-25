const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType, EmbedBuilder } = require('discord.js');
const { scrapeCpuList, scrapeCpuDetails } = require('./cpuSearch');

function formatCpuDetails(specs, includeFields) {
    let description = '';

    for (const [category, details] of Object.entries(specs)) {
        if (includeFields.includes(category)) {
            if (category === 'Cache') {
                description += `**${category}**\n`;
                const cacheDetails = [];
                for (const [key, value] of Object.entries(details)) {
                    const formattedKey = key.replace(/^# /, '').replace(/:$/, '');
                    const formattedValue = value.replace(/ \(shared\)/, '');
                    cacheDetails.push(`**${formattedKey}:** ${formattedValue}`);
                }
                description += cacheDetails.join(', ') + '\n\n';
            } else {
                description += `**${category}**\n`;
                let frequency = '';
                let turboClock = '';
                for (const [key, value] of Object.entries(details)) {
                    const formattedKey = key.replace(/^# /, '').replace(/:$/, '');
                    if (formattedKey === 'Frequency') {
                        frequency = value.replace(/:$/, '').replace(' GHz', '');
                    } else if (formattedKey === 'Turbo Clock') {
                        turboClock = value.replace(/:$/, '').replace('up to ', '').replace(' GHz', '');
                    } else {
                        description += `**${formattedKey}:** ${value.replace(/:$/, '')}\n`;
                    }
                }
                if (frequency && turboClock) {
                    description += `**Frequency:** ${frequency}-${turboClock} GHz\n`;
                } else if (frequency) {
                    description += `**Frequency:** ${frequency} GHz\n`;
                }
                description = description.replace('-N/A', '');
                description += '\n';
            }
        }
    }

    // Remove unwanted fields using regex
    description = description.replace(/^\*\*Features:.*\n?/gm, '');
    description = description.replace(/^\*\*SMP # CPUs:.*\n?/gm, '');
    description = description.replace(/^\*\*ECC Memory:.*\n?/gm, '');
    description = description.replace(/^\*\*Part#:.*\n?/gm, '');
    description = description.replace(/^\*\*Production Status:.*\n?/gm, '');
    description = description.replace(/^\*\*Package:.*\n?/gm, '');
    description = description.replace(/^\*\*Die Size:.*\n?/gm, '');
    description = description.replace(/^\*\*Transistors:.*\n?/gm, '');
    description = description.replace(/^\*\*I\/O Process Size:.*\n?/gm, '');
    description = description.replace(/^\*\*I\/O Die Size:.*\n?/gm, '');
    description = description.replace(/^\*\*Memory Bus:.*\n?/gm, '');

    return description.trim();
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cpu')
        .setDescription('Scrapes CPU specs from TechPowerUp')
        .addStringOption(option => 
            option.setName('query')
                .setDescription('The CPU to search for')
                .setRequired(true)),
    async execute(interaction) {
        const query = interaction.options.getString('query');
        await interaction.deferReply();

        const results = await scrapeCpuList(query);

        if (results.length === 0) {
            await interaction.editReply('No results found.');
            return;
        }

        if (results.length === 1) {
            const specs = await scrapeCpuDetails(results[0].link);

            if (specs) {
                const embed = new EmbedBuilder()
                    .setTitle(results[0].name)
                    .setURL(results[0].link)
                    .setColor(0x00AE86)
                    .setDescription(formatCpuDetails(specs, ['Physical', 'Processor', 'Performance', 'Architecture', 'Core Config', 'Cache']))
                    .setFooter({ text: 'Powered by TechPowerUp' });

                await interaction.editReply({
                    components: [],
                    embeds: [embed],
                    content: '',
                });
            } else {
                await interaction.editReply('Error fetching CPU details.');
            }

            return;
        }

        const dropdown = new StringSelectMenuBuilder()
            .setCustomId(interaction.id)
            .setPlaceholder('Select a CPU');

        results.slice(0, 25).forEach(result => {
            dropdown.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(result.name)
                    .setValue(result.link)
            );
        });

        const row = new ActionRowBuilder().addComponents(dropdown);

        const reply = await interaction.editReply({
            content: 'Choose a CPU',
            components: [row],
        });

        const collector = reply.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            filter: (i) => i.user.id === interaction.user.id && i.customId === interaction.id,
            time: 30_000,
        });

        collector.on('collect', async (selectInteraction) => {
            const selectedUrl = selectInteraction.values[0];
            const specs = await scrapeCpuDetails(selectedUrl);
            const selectedName = results.find(result => result.link === selectedUrl).name;

            if (specs) {
                const embed = new EmbedBuilder()
                    .setTitle(selectedName)
                    .setURL(selectedUrl)
                    .setColor(0x00AE86)
                    .setDescription(formatCpuDetails(specs, ['Physical', 'Processor', 'Performance', 'Architecture', 'Core Config', 'Cache']))
                    .setFooter({ text: 'Powered by TechPowerUp' });

                await selectInteraction.update({
                    components: [],
                    embeds: [embed],
                    content: '',
                });
            } else {
                await selectInteraction.update({
                    components: [],
                    content: 'Error fetching CPU details.',
                });
            }
        });
    },
};