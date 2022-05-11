const Event = require('../classes/Event.js');

const voiceStateUpdate = new Event(client, async (oldState, newState) => {
    if(newState.channelId == client.creatende_privat_voice.id) {
        const channel = await client.guild.channels.create(`🔒 ${newState.member.user.tag}`, {
            type: 'GUILD_VOICE',
            parent: newState.channel.parent,
            userLimit: 2
        })
        client.privat_voices.push(channel);
        await newState.member.edit({
            channel: channel
        })
    }

    client.privat_voices.forEach(async (voice, index) => {
        if(oldState.channelId == voice.id && oldState.channel.members.size == 0) {
            await voice.delete();
            client.privat_voices.splice(index, 1)
        }
    });
});

module.exports = voiceStateUpdate;