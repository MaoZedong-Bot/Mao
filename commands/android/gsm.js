const { ActionRowBuilder, SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType, InteractionCollector } = require('discord.js');
const gsmarena = require('gsmarena-api');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('gsm')
		.setDescription('Get GSMArena specifications for a device')
        .addStringOption(option =>
            option.setName('device')
                .setDescription('Device')
                .setRequired(true)
        ),
	async execute(interaction) {
        const deviceQuery = interaction.options.getString('device');
        let deviceNames = [];
        let deviceIDs = [];
        let deviceNameList = "";
        let categories = [];
        let specName = "";
        let specValue = "";
        const excludedSpecs = [
            'Speed', '2G bands', '3G bands', '4G bands', 'SIM', ' ', 
            'Infrared port', 'Radio', 'Sensors', 'Video', 'Features',
            'CPU', 'GPU', 'Protection',
            'NFC', 'Positioning', 'Loudspeaker ', 'Loudspeaker']
        const excludedCategories = ['Tests', 'Features', 'Misc']

        const deviceList = await gsmarena.search.search(deviceQuery);
        console.log(deviceList)

        deviceList.forEach(device => {
            deviceNames.push(device.name);
            deviceIDs.push(device.id);
        });

        if (deviceNames.length == 0) {
            interaction.reply(`Could not find such device! (${deviceQuery})`)
            return;
        }

        const dropdown = new StringSelectMenuBuilder()
            .setCustomId(interaction.id)
            .setPlaceholder('Select a model');

        for (let i = 0; i < deviceNames.length; i++) {
            if (i + 1 >= 26) {
                break;
            }
            dropdown.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(deviceNames[i])
                    .setValue(deviceIDs[i])
            )
        }

        const row = new ActionRowBuilder()
            .addComponents(dropdown);

        const reply = await interaction.reply({
                content: 'Choose a device',
                components: [row],
        });

        const collector = reply.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            filter: (i) => i.user.id === interaction.user.id && i.customId === interaction.id,
            time: 30_000,
        });

        collector.on('collect', interaction => {
            if (!interaction.values.length) {
                interaction.reply('something went VERY wrong please file an issue and contact either developer');
                return;
            }

            handleCollectorInteraction(interaction);
            
        });


        async function handleCollectorInteraction(interaction) {
            try {
                if (!interaction.values.length) {
                    interaction.reply('fuck');
                    return;
                }

                const deviceInfo = await gsmarena.catalog.getDevice(interaction.values[0]);

                const embed = new EmbedBuilder()
                    .setTitle(`${deviceInfo.name}`)
                    .setURL(`https://www.gsmarena.com/${interaction.values[0]}.php`)
                    .setColor('#0099ff')
                    .setThumbnail(deviceInfo.img)
                    .setFooter({ text: 'Specs by GSMarena' });

                    deviceInfo.detailSpec.forEach(item => {            
                        if (excludedCategories.includes(item.category)) {
                            return; 
                        }

                        let specsText = '';
                        item.specifications.forEach(spec => {

                            if (excludedSpecs.includes(spec.name)) {
                                return; 
                            }
                            specsText += `* ${spec.name}: ${spec.value}\n`;
                        });
                        
                        embed.addFields({ name: `${item.category}`, value: `${specsText}`, inline: true });
                    });

                await interaction.update({
                    components: [],
                    embeds: [embed],
                    content: '',
                });
                

            } catch (error) {
                console.log('Error fetching device info:', error);
            }
        }

	},
};
