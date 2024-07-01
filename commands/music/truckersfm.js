const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { createAudioPlayer, createAudioResource, joinVoiceChannel } = require('@discordjs/voice');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('truckersfm')
		.setDescription('TruckersFM')
        .addSubcommand(subcommand =>
            subcommand
                .setName('play')
                .setDescription('Play TruckersFM')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('schedule')
                .setDescription('Get TruckersFM Schedule')
        ),
	async execute(interaction) {

        if (interaction.options.getSubcommand() === 'play') {
            let icon = "";
            let time = "";
            const presenterUrl = 'https://radiocloud.pro/api/public/v1/presenter/live';
            const presenterInfo = await axios.get(presenterUrl);

            let presenterName = presenterInfo.data.data.user.name;
            let presenterShow = presenterInfo.data.data.description;
            let presenterImage = presenterInfo.data.data.image

            let presenterStartUNIX = presenterInfo.data.data.start;
            let presenterEndUNIX = presenterInfo.data.data.end;

            const presenterStartUNIX_parsed = new Date(presenterStartUNIX * 1000);
            const presenterEndUNIX_parsed = new Date(presenterEndUNIX * 1000);


            const startTime = presenterStartUNIX_parsed.toLocaleTimeString('de-DE', {
                hour: '2-digit',
                minute: '2-digit',
            });

            const endTime = presenterEndUNIX_parsed.toLocaleTimeString('de-DE', {
                hour: '2-digit',
                minute: '2-digit',
            });

            if (String(presenterName).valueOf() === "AutoDJ") {
                time = "__*Automatic player. Lasts until next show.*__"
            } else {
                time = "**Time:** ";
                time += startTime;
                time += "-";
                time += endTime;
            }

            icon = new AttachmentBuilder(`./images/tfm.png`);

            try {
                const voiceChannelId = interaction.member.voice.channelId;

                const connection = joinVoiceChannel({
                    channelId: voiceChannelId,
                    guildId: interaction.guild.id,
                    adapterCreator: interaction.guild.voiceAdapterCreator,
                });

                const mp3Url = 'https://radio.truckers.fm'; 

                // Fetch the MP3 stream using Axios
                const response = await axios.get(mp3Url, { responseType: 'stream' });

                const stream = response.data;
                const player = createAudioPlayer();

                const resource = createAudioResource(stream, {
                    inlineVolume: true, // Adjust volume if needed
                });

                player.play(resource);
                connection.subscribe(player);


                const embed = new EmbedBuilder();
                embed
                    .setTitle(`TruckersFM`)
                    .setColor('#FF5555')
                    .setThumbnail(`${presenterImage}`)
                    .setDescription(`**Presenter:** ${presenterName}\n**Current Show:** ${presenterShow}\n${time}`)
                    .setFooter({ text: `Your Drive. Your Music. TruckersFM. | All times in UTC.`, iconURL: 'https://truckersfm.s3.fr-par.scw.cloud/static/tfm-2020.png' });

                interaction.reply({ embeds: [embed] });
            } catch (error) {
                console.error('Error:', error);
                interaction.reply(`Something went wrong: ${error.message}`);
            }
        
        } else if (interaction.options.getSubcommand() === 'schedule') {
            var datetime = new Date();
            console.log(datetime.toISOString().slice(0,10));

            const embed = new EmbedBuilder();
            embed
                .setTitle(`TruckersFM Schedule for ${datetime.toISOString().slice(0,10)}`)
                .setColor('#FF5555')
                .setFooter({ text: `Your Drive. Your Music. TruckersFM. | All times in UTC.`, iconURL: 'https://truckersfm.s3.fr-par.scw.cloud/static/tfm-2020.png' });

            const todayStart = new Date(new Date().setUTCHours(0, 0, 0, 0));
            const tomorrowStart = new Date(new Date(new Date().setUTCHours(0, 0, 0, 0)).setDate(new Date().getDate() + 1));

            const todayUNIX = Date.parse(todayStart)/1000;
            console.log(todayUNIX)
            const tomorrowUNIX = Date.parse(tomorrowStart)/1000;

            const scheduleUrl = `https://radiocloud.pro/api/public/v1/slots/${todayUNIX}/${tomorrowUNIX}`;
            const scheduleInfo = await axios.get(scheduleUrl);
            const scheduleData = scheduleInfo.data.data;

            for (let i = 0; i < scheduleData.length; i++) {

                // parsing UNIX
                let presenterStartUNIX = scheduleData[i].start;
                let presenterEndUNIX = scheduleData[i].end;

                const presenterStartUNIX_parsed = new Date(presenterStartUNIX * 1000);
                const presenterEndUNIX_parsed = new Date(presenterEndUNIX * 1000);

                if (presenterStartUNIX < todayUNIX) {
                    continue;
                }

                const startTime = presenterStartUNIX_parsed.toLocaleTimeString('de-DE', {
                    hour: '2-digit',
                    minute: '2-digit',
                });

                const endTime = presenterEndUNIX_parsed.toLocaleTimeString('de-DE', {
                    hour: '2-digit',
                    minute: '2-digit',
                });

                embed.addFields({ name: `${scheduleData[i].description}`, value: `**Presenter:** ${scheduleData[i].user.name}\n**Time:** ${startTime}-${endTime}`, inline: true })
            }


            interaction.reply({ embeds: [embed] });
        }

	},
};
