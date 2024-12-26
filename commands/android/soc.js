const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType, EmbedBuilder } = require('discord.js');

function formatSoCDetails(specs, includeFields) {
    let description = '';

    for (const [label, value] of Object.entries(specs)) {
            if (label === 'Cache') {
                description += `**${label}**\n`;
                const cachevalue = [];
                for (const [key, value] of Object.entries(value)) {
                    const formattedKey = key.replace(/^# /, '').replace(/:$/, '');
                    const formattedValue = value.replace(/ \(shared\)/, '');
                    cachevalue.push(`**${formattedKey}:** ${formattedValue}`);
                }
                description += cachevalue.join(', ') + '\n\n';
            } else {

                const forbiddenFields = ["Features", "SMP # CPUs", "ECC Memory", "Part#", "Production Status", 
                    "Package", "Die Size", "Transistors", "I/O Process Size", "I/O Die Size", "Memory Bus", "PPT" , 
                    "Bundled Cooler", "PL2 Tau Limit", "Multiplier", "PL2", "PL1", "Base Clock"];

                description += `**${label}**\n`;
                let frequency = '';
                let turboClock = '';
                let cores = '';
                let threads = ''
                for (const [key, value] of Object.entries(value)) {
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

    return description.trim();
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('soc')
        .setDescription('Scrapes SoC specs from PhoneDB')
        .addStringOption(option => 
            option.setName('query')
                .setDescription('The SoC to search for')
                .setRequired(true)),
    async execute(interaction) {
        const { scrapeSocList, scrapeSoCDetails } = require('./socSearch');

        const query = interaction.options.getString('query');

        const results = await scrapeSocList(query);
        console.log(results)

        if (results.length === 0) {
            await interaction.reply('No results found.');
            return;
        }

        const dropdown = new StringSelectMenuBuilder()
            .setCustomId(interaction.id)
            .setPlaceholder('Select an SoC');

        for (let i = 0; i < Math.min(25, results.length); i++) {
            const result = results[i];
            if (!result || !result.name) {
                console.warn(`Skipping invalid result at index ${i}:`, result);
                continue;
            }
        
            dropdown.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(result.name)
                    .setValue(i.toString())
            );
        }

        const row = new ActionRowBuilder().addComponents(dropdown);

        const reply = await interaction.reply({
            content: 'Choose an SoC',
            components: [row],
        });

        const collector = reply.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            filter: (i) => i.user.id === interaction.user.id && i.customId === interaction.id,
            time: 30_000,
        });

        collector.on('collect', async (interaction) => {
            const selectedUrl = interaction.values[0];
            const url = results[Number(selectedUrl)].link;
            const specs = await scrapeSoCDetails(results[Number(selectedUrl)].link);
            const selectedName = results[Number(selectedUrl)].name;

            if (specs) {
                const embed = new EmbedBuilder()
                    .setTitle(selectedName)
                    .setURL(url)
                    .setColor(0x00AE86)
                    //.setDescription('cum')
                    .setDescription(formatSoCDetails(specs, []))
                    .setFooter({ text: 'Powered by PhoneDB' });

                await interaction.update({
                    components: [],
                    embeds: [embed],
                    content: '',
                });
            } else {
                await interaction.update({
                    components: [],
                    content: 'Error fetching CPU value.',
                });
            }
        });

    }
}