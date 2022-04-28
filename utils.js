const log = require('./classes/Logger.js');


async function findOrCreateChannel(client, name) {
    
    const channels = await client.guild.channels.fetch();
    
    const channel = channels.find(channel => {
        if(channel.name.toString().toLowerCase() === name.toString().replace(' ', '-').toLowerCase()) return true
    })

    let new_channel;

    if(channel) {
        new_channel = channel;
        await channel.edit({
            type: 'GUILD_TEXT'
        })
    } else {
        log(`Каналу \"${name}\" ще немає. Створюєм...`, 'warning')
        await this.client.guild.channels.create(name)
        .then((channel) => {new_channel = channel; log(`Канал \"${name}\" створено`)})

    }

    return new_channel;
}

module.exports.findOrCreateChannel = findOrCreateChannel;