const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

function searchDevices(cdn, data) {
    if (!cdn) {
        throw new Error("Target device cannot be null or undefined.");
    }

    const results = [];

    for (const brand in data) {
        if (data.hasOwnProperty(brand)) {
            const devices = data[brand];
            for (const device of devices) {
                if (device.device.includes(cdn) && device.name !== '') {
                    results.push({ brand, name: device.name, device: device.device });
                }
            }
        }
    }

    return results.length > 0 ? results : null;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('device')
        .setDescription('Get a device\'s name from its codename')
        .addStringOption(option =>
            option.setName('codename')
                .setDescription('The codename to lookup')
                .setRequired(true)
        ),
    async execute(interaction) {
        const cdn2 = await interaction.options.getString('codename');
        const cdn = await cdn2.replace(/[&\/\\#,()@$~%.'":*?<>{}`]/g, '');
        const url = 'https://raw.githubusercontent.com/androidtrackers/certified-android-devices/master/by_brand.json';

        try {
            const json = await axios.get(`${url}`);
            const jsonData = json.data;

            const devices = await searchDevices(cdn, jsonData);
            if (!devices) {
                await interaction.reply("Codename not found!");
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle(`Devices matching \`${cdn}\``)
                .setColor('#2eb237');

            let counter = 0;
            let lastName = "what";
            let split = [];

            devices.forEach(result => {
                split = result.name.split(" ");
                if (counter <= 24) {
                    if (lastName !== result.name) {

                        if (result.brand.toLowerCase() === split[0].toLowerCase()){
                            embed.addFields({
                                name: `${result.name}`,
                                value: `\`${result.device}\``, 
                                inline: true 
                            });
                        } else {
                            embed.addFields({
                                name: `${result.brand} ${result.name}`,
                                value: `\`${result.device}\``, 
                                inline: true 
                            });
                        }
                        

                    }
                }
                lastName = result.name;
                counter++
            });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching device:', error);
            await interaction.reply({ content: 'An error occurred while fetching the devices. Please try again later.', ephemeral: true });
        }
    },
};
