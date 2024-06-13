const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonStyle, ButtonBuilder, ComponentType } = require('discord.js');
const { useMainPlayer, useQueue } = require('discord-player');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('music')
		.setDescription('Music manager dashboard'),
	async execute(interaction) {

        const player = useMainPlayer();
        const channel = interaction.member.voice.channelId;
        const queue = useQueue(interaction.guild.id);
        const currentTrack = queue.currentTrack;
        const tracksArray = queue.tracks.toArray();
        if (!channel) return interaction.reply('You are not connected to a voice channel!'); // make sure we have a voice channel
    
        const playPause = new ButtonBuilder()
            .setCustomId('playpause')
            .setLabel('⏯')
            .setStyle(ButtonStyle.Primary);

        const skip = new ButtonBuilder()
            .setCustomId('skip')
            .setLabel('⏭')
            .setStyle(ButtonStyle.Secondary);

        const clear = new ButtonBuilder()
            .setCustomId('clear')
            .setLabel('❌')
            .setStyle(ButtonStyle.Danger);

            
		const row = new ActionRowBuilder()
            .addComponents(playPause, skip, clear);
        
        const embed = new EmbedBuilder();

        embed
            .setTitle(`${currentTrack}`)
            .setDescription(`Next track: ${tracksArray[0]}`)
            .setThumbnail(`${currentTrack.thumbnail}`)
            .addFields({ name: `Duration:`, value: `${currentTrack.duration}`, inline: true }, 
                        { name: 'Songs left:', value: `${queue.getSize()}`, inline: true }
            );

            
		const reply = await interaction.reply({
			content: `_ _`,
            embeds: [embed],
			components: [row],
		});

        const collector = reply.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 3_600_000 });

        const collectorFilter = i => i.user.id === interaction.user.id;

	},
};
