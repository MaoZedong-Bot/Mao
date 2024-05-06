const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useMainPlayer } = require('discord-player');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Play a song (Search by name)')
        .addStringOption(option => option.setName('query').setDescription('Song name').setRequired(true)),
	async execute(interaction) {

        const player = useMainPlayer();
        const channel = interaction.member.voice.channelId;
        if (!channel) return interaction.reply('You are not connected to a voice channel!'); // make sure we have a voice channel
        const query = interaction.options.getString('query', true); // we need input/query to play
    
        // let's defer the interaction as things can take time to process
        await interaction.deferReply();
        let username = interaction.user.username;
    
        try {
            const { track } = await player.play(channel, query, {
                nodeOptions: {
                    // nodeOptions are the options for guild node (aka your queue in simple word)
                    metadata: interaction // we can access this metadata object using queue.metadata later on
                }
            });
            const embed = new EmbedBuilder();
            embed
                .setTitle(`Added to queue`)
                .setColor('#00FFFF')
                .setThumbnail(track.thumbnail)
                .setDescription(`${track.author} - **${track.title}**\nDuration: ${track.duration}`)
                .setFooter({ text: `Requested by ${username}, ${track.url}` });
    
            return interaction.followUp({ embeds: [embed] });
        } catch (e) {
            // let's return error if something failed
            return interaction.followUp(`Something went wrong: ${e}`);
        }

	},
};
