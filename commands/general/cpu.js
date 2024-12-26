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

                const forbiddenFields = ["Features", "SMP # CPUs", "ECC Memory", "Part#", "Production Status", 
                    "Package", "Die Size", "Transistors", "I/O Process Size", "I/O Die Size", "Memory Bus", "PPT" , 
                    "Bundled Cooler", "PL2 Tau Limit", "Multiplier", "PL2", "PL1", "Base Clock"];

                description += `**${category}**\n`;
                let frequency = '';
                let turboClock = '';
                let cores = '';
                let threads = ''
                for (const [key, value] of Object.entries(details)) {
                    const formattedKey = key.replace(/^# /, '').replace(/:$/, '');

                    if (forbiddenFields.includes(formattedKey)) {
                        ;
                    } else if (formattedKey === 'Frequency') {
                        frequency = value.replace(/:$/, '').replace(' GHz', '');
                    } else if (formattedKey === 'Turbo Clock') {
                        turboClock = value.replace(/:$/, '').replace('up to ', '').replace(' GHz', '');
                    } else if (formattedKey === 'of Cores') {
                        cores = value.replace(/:$/, '');
                    } else if (formattedKey === 'of Threads') {
                        threads = value.replace(/:$/, '');
                    } else {
                        description += `**${formattedKey}:** ${value.replace(/:$/, '')}\n`;
                    }
                }
                if (frequency && turboClock) {
                    description += `**Frequency:** ${frequency}-${turboClock} GHz\n`;
                } else if (frequency) {
                    description += `**Frequency:** ${frequency} GHz\n`;
                }
                if (cores && threads) {
                    description += `**Cores:** ${cores}C/${threads}T\n`;
                }
                description = description.replace('-N/A', '');
                description += '\n';
            }
        }
    }

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
        const query2 = interaction.options.getString('query');
        const query = query2.replace(/[&\/\\#,()@$~%.'":*?<>{}`]/g, '');
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