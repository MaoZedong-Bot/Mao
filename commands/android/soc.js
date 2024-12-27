const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType, EmbedBuilder } = require('discord.js');

function formatSoCDetails(specs) {
    let description = '';
    let forbiddenFields = ['Function', 'Width of Machine Word', 'Number of processor core(s)', 
        'Data Bus Width', 'Semiconductor Technology', 'Special Features››', 'Data Integrity', 'Added',
        'GPU Clock', 'Supported Cellular Data Links', 'Max. Data Rate', 'Number of data bus channels',
        'Special Features'
    ]
    let val;
    let lbl;
    let repl = [
        {
            'original': 'Non-volatile Memory Interface',
            'new': 'Storage Type'
        },
        {
            'original': 'Embedded GPU',
            'new': 'Graphics'
        },
        {
            'original': 'Memory Interface(s)',
            'new': 'RAM Type'
        },
        {
            'original': 'Max. Clock Frequency of Memory IF',
            'new': 'RAM Frequency'
        },
        {
            'original': 'Type of processor core(s)',
            'new': 'Cores'
        },
        {
            'original': 'Supported Instruction Set(s)',
            'new': 'Instruction Set'
        }
    ]

    specs.forEach(spec => {
        val = spec.value.toString();
        lbl = spec.label.toString();
        repl.forEach(rep => {
            lbl = lbl.replace(rep.original, rep.new)
        });
        if (!forbiddenFields.includes(spec.label)) description += `**${lbl}:** ${val.replace(/\n/g, '')}\n`;
    })

    return description;
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
        const { scrapeSocList, scrapeSoCDetails, getSocImage } = require('./socSearch');

        await interaction.deferReply();

        const query = interaction.options.getString('query');

        const results = await scrapeSocList(query);

        if (results.length === 0) {
            await interaction.editReply('No results found.');
            return;
        } else if (results.length === 1) {
            const url = results[0].link;
            const specs = await scrapeSoCDetails(results[0].link);
            const selectedName = results[0].name;

            if (specs) {
                const embed = new EmbedBuilder()
                    .setTitle(selectedName)
                    .setURL(url)
                    .setColor(0x00AE86)
                    .setDescription(await formatSoCDetails(specs))
                    .setFooter({ text: 'Powered by PhoneDB' });
                
                const img = await getSocImage(results[0].link);
                if (img) {
                    await embed.setThumbnail(img);
                }

                await interaction.editReply({
                    components: [],
                    embeds: [embed],
                    content: '',
                });
            } else {
                await interaction.editReply({
                    components: [],
                    content: 'Error fetching CPU value.',
                });
            }
        } else {

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

            const reply = await interaction.editReply({
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
                        .setDescription(await formatSoCDetails(specs))
                        .setFooter({ text: 'Powered by PhoneDB' });
                    
                    const img = await getSocImage(results[Number(selectedUrl)].link);
                    if (img) {
                        await embed.setThumbnail(img);
                    }

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
}
