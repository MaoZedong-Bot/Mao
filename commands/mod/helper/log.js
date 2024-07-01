const { EmbedBuilder } = require("discord.js");

// LOG TYPES
// // 0: Message deletion (automod)
// // 1: User warn
// // 2: User timeout
// // 3: Automod
// // 4: User kick
// // 5: User ban
// // 6: User unban
// // 7: Lockdown Start
// // 8: Lockdown End
async function log(interaction, type, content, target, reason, duration, muted) {

    return;

    const embed = new EmbedBuilder();
    // TODO: logs are fucking broken i need to SQL this
    //const { logsChannel } = require('../../../config.json')
    const channel = await interaction.client.channels.fetch(logsChannel);

    switch(type) {
        case 0: // Deletion
            embed
                .setTitle('Message deleted (automod)')
                .setDescription(`${interaction.author.username} (${interaction.author.id}): ${content}`)
                .setColor('#FF0000');
            
            await channel.send({ embeds: [embed] });

            break;

        case 1: // Warn
            embed
                .setTitle('Warn')
                .setDescription(`From <@${interaction.user.id}>`)
                .addFields({ name: `${target.username} (${target.id}) warned for:`, value: `${reason}` })
                .setColor('#FF3300');

            await channel.send({ embeds: [embed] });
            break;

        case 2: // Timeout
            embed
                .setTitle('User muted')
                .setDescription(`From <@${interaction.user.id}>`)
                .addFields({ name: `${target.username} (${target.id}) muted for:`, value: `${reason}` })
                .addFields({ name: `Duration:`, value: `${duration}` });
            
            await channel.send({ embeds: [embed] });
            break;
        
        case 3: // Automod
            embed
                .setTitle('Automod');
            
            if (muted) {
                embed.setDescription('Muted user')
                    .addFields({ name: `${target.username} (${target.id}) muted for:`, value: `${reason}` })
                    .addFields({ name: `Duration:`, value: `${duration}` })
                    .addFields({ name: `Message content:`, value: `${content}` })
                    .setColor('#FF0000');

            } else {
                embed.setDescription('Deleted message')
                    .addFields({ name: `${target.username} (${target.id}):`, value: `${content}` })
                    .setColor('#000000');
            }
            
            await channel.send({ embeds: [embed] });
            break;

        case 4: // Kick
            embed
                .setTitle('User kicked')
                .setDescription(`From <@${interaction.user.id}>`)
                .addFields({ name: `${target.username} (${target.id}) kicked for:`, value: `${reason}` })
                .setColor('#FF3300');

            await channel.send({ embeds: [embed] });
            break;

        case 5: // Ban
            embed
                .setTitle('User banned')
                .setDescription(`From <@${interaction.user.id}>`)
                .addFields({ name: `${target.username} (${target.id}) banned for:`, value: `${reason}` })
                .setColor('#FF3333');

            await channel.send({ embeds: [embed] });
            break;

        case 6: // Unban
            embed
                .setTitle('User unbanned')
                .setDescription(`From <@${interaction.user.id}>`)
                .addFields({ name: `${target.username} (${target.id}) was unbanned.`, value: `‼` })
                .setColor('#3333FF');

            await channel.send({ embeds: [embed] });
            break;

        case 7: // Lockdown Start
            embed
                .setTitle('🚨 Lockdown Started 🚨')
                .setDescription(`Triggered by <@${interaction.user.id}>`)
                .addFields({ name: `Reason:`, value: `${reason}` })
                .setColor('#FF0000');

            await channel.send({ embeds: [embed] });
            break;
        
        case 8: // Lockdown End
            embed
                .setTitle('🔰 Lockdown Ended 🔰')
                .setDescription(`Triggered by <@${interaction.user.id}>`)
                .setColor('#3333FF');

            await channel.send({ embeds: [embed] });
            break;

        default:
            break;
    }
}

module.exports = {
    log,
};