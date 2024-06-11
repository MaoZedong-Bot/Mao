function buttonIdHandler(id, msg) {

    const { useMainPlayer, useQueue } = require('discord-player');
    const { guildId } = require('../../config.json');
    const queue = useQueue(guildId);
    const currentTrack = queue.currentTrack;
    
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