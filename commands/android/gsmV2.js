const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, EmbedBuilder, AttachmentBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType, InteractionCollector } = require('discord.js');

const axios = require('axios');
const cheerio = require('cheerio');

async function scrapePhoneSpecs(url) {
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
            }
        });
        const $ = cheerio.load(data);

        const specs = {};

        specs.name = $('h1.specs-phone-name-title').text().trim();
        specs.imageUrl = $('div.specs-photo-main img').attr('src');

        const specCategories = [
            'Network', 'Launch', 'Body', 'Display', 'Platform', 'Memory', 'Main Camera', 'Selfie camera', 'Sound', 'Comms', 'Features', 'Battery', 'Misc'
        ];

        specCategories.forEach(category => {
            specs[category] = {};
            $(`th:contains(${category})`).closest('table').find('tr').each((i, element) => {
                const key = $(element).find('td.ttl').text().trim();
                const value = $(element).find('td.nfo').text().trim();
                if (key && value) {
                    specs[category][key] = value;
                }
            });
        });

        return specs;
    } catch (error) {
        console.error('Error scraping phone specs:', error);
        return null;
    }
}

function formatDescription(specs, excludeFields) {
    let description = '';

    for (const [category, details] of Object.entries(specs)) {
        if (category !== 'name' && category !== 'imageUrl') {
            if (category === 'Main Camera' || category === 'Selfie camera') {
                description += `**${category.replace(' camera', ' Camera')}:**\n`;
            }
            for (const [key, value] of Object.entries(details)) {
                if (!excludeFields.includes(key)) {
                    if (key === 'Single' || key === 'Dual' || key === 'Triple' || key === 'Quad' || key === 'Penta') {
                        description += `${value}\n`;
                    } else if (key === 'Technology') {
                        description += `**Networks:** ${value}\n`;
                    } else if (key === 'Dimensions' && value.includes('Folded:')) {
                        const dimensions = value.split('Folded:');
                        description += `**${key}:**\n${dimensions[0].trim()}\nFolded: ${dimensions[1].trim()}\n`;
                    } else if (key === 'Dimensions') {
                        description += `**${key}:** ${value}\n`;
                    } else {
                        description += `**${key}:** ${value}\n`;
                    }
                }
            }
        }
    }

    description = description.replace(/Cover camera:/g, '**Cover camera:**');

    return description;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gsm')
        .setDescription('Get device specifications from GSMArena')
        .addStringOption(option => 
            option.setName('device')
                .setDescription('Device name')
                .setRequired(true)),
    async execute(interaction) {
        const { parseResults } = require('./gsmSearch');
        const device2 = interaction.options.getString('device');
        const device = await device2.replace(/[&\/\\#,()@$~%.'":*?<>{}`]/g, '');

        if (device.toLowerCase() === 'sabanero') {
            return await interaction.reply('https://cdn.0000024.xyz/sabanero.mp4');
            // cant express how much i love slop
        } else if (device.toLowerCase() === 'i love slop') {
            const pez = new AttachmentBuilder('./images/slop.png');
            return await interaction.reply({ files: [pez] });
        } else if (device.toLowerCase() === 'peces en el rio') {
            ////
            // PERO MIRA CÓMO BEBEN LOS PECES EN EL RÍO
            // PERO MIRA CÓMO BEBEN POR VER AL DIOS NACIDO
            // BEBEN Y BEBEN Y VUELVEN A BEBER
            // LOS PECES EN EL RÍO POR VER A DIOS NACER
            ////
            return await interaction.reply('https://cdn.0000024.xyz/peces.mp4');
        } else {
            await interaction.deferReply(); // Defer the reply
        }

        const dropdown = new StringSelectMenuBuilder()
            .setCustomId(interaction.id)
            .setPlaceholder('Select a model');

        const results = await parseResults(device);

        if (results.length === 0) {
            await interaction.editReply({
                content: 'No devices found. Please try a different search term.',
                components: [],
            });
            return;
        }

        for (let i = 0; i < results.length; i++) {
            if (i + 1 >= 26) {
                break;
            }
            dropdown.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(results[i].name)
                    .setValue(results[i].link)
            );
        }

        const row = new ActionRowBuilder()
            .addComponents(dropdown);

        if (results.length > 1) {
            const reply = await interaction.editReply({
                content: `Choose a device`,
                components: [row],
            });

            const collector = reply.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
                filter: (i) => i.user.id === interaction.user.id && i.customId === interaction.id,
                time: 30_000,
            });

            collector.on('collect', async interaction => {
                if (!interaction.values.length) {
                    await interaction.reply('something went VERY wrong please file an issue and contact either developer');
                    return;
                }

                handleCollectorInteraction(interaction);
            });

            async function handleCollectorInteraction(interaction) {
                try {
                    console.log(`values: ${interaction.values}`);
                    const specs = await scrapePhoneSpecs(interaction.values[0]);
                    if (specs) {
                        const embed = new EmbedBuilder()
                            .setTitle(specs.name)
                            .setURL(interaction.values[0])
                            .setColor(0x00AE86)
                            .setThumbnail(specs.imageUrl)
                            .setFooter({ text: 'Powered by GSMArena' }); // Ensure footer is set

                        const excludeFields = ['GPRS', 'EDGE', '2G bands', '3G bands', '4G bands', '5G bands', 'Speed', 'CPU', 'GPU', 'NFC', 'Price', 'Video', 'Loudspeaker', '3.5mm jack', 'Radio', 'SAR', 'SAR EU', 'WLAN', 'Positioning', 'SIM', 'Card slot', 'Sensors', 'Announced', 'Features'];
                        const description = formatDescription(specs, excludeFields);
                        embed.setDescription(description);

                        await interaction.update({
                            components: [],
                            embeds: [embed],
                            content: '',
                        });
                    }
                } catch (error) {
                    console.log('Error fetching device info:', error);
                }
            }
        } else if (results.length === 1) {
            const specs = await scrapePhoneSpecs(results[0].link);
            if (specs) {
                const embed = new EmbedBuilder()
                    .setTitle(specs.name)
                    .setURL(results[0].link)
                    .setColor(0x00AE86)
                    .setThumbnail(specs.imageUrl)
                    .setFooter({ text: 'Powered by GSMArena' }); // Ensure footer is set

                const excludeFields = ['GPRS', 'EDGE', '2G bands', '3G bands', '4G bands', '5G bands', 'Speed', 'CPU', 'GPU', 'NFC', 'Price', 'Video', 'Loudspeaker', '3.5mm jack', 'Radio', 'SAR', 'SAR EU', 'WLAN', 'Positioning', 'SIM', 'Card slot', 'Sensors', 'Announced', 'Features'];
                const description = formatDescription(specs, excludeFields);
                embed.setDescription(description);

                await interaction.editReply({
                    components: [],
                    embeds: [embed],
                    content: '',
                });
            }
        }
    },
};