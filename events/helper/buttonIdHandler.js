function buttonIdHandler(id, msg) {
    const guildId = msg.guild.id;

    const { useMainPlayer, useQueue } = require('discord-player');
    const player = useMainPlayer();
    //const queue = useQueue(guildId);
    const queue = player.nodes.get(guildId);
    if (!queue || !queue.currentTrack) {
        return msg.edit("No track is currently playing.");
    }
    //const currentTrack = queue.currentTrack;
    const currentTrack = queue.currentTrack.title; // Get the title of the current track
    

    
    
    switch(id) {
        case "playpause":
            queue.node.setPaused(!queue.node.isPaused());
            if (!queue.node.isPaused()) {
                msg.edit(`Resuming **${currentTrack}**`);
            } else {
                msg.edit(`Paused player`);
            }
            break;
        
        case "skip":
            msg.edit(`Skipping **${currentTrack}**`)
            queue.node.skip();
            break;
        
        case "clear":
            msg.delete();
            break;
        
        default:
            msg.edit(`**Achievement get:** How did we get here?\nSeriously how did you get an invalid ID`);

    }

}

module.exports = {
    buttonIdHandler,
};