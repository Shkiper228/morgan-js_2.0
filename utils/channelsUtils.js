const log = require('../classes/Logger.js');

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
        await client.guild.channels.create(name)
        .then((channel) => {new_channel = channel; log(`Канал \"${name}\" створено`)})

    }

    return new_channel;
}

module.exports.findOrCreateChannel = findOrCreateChannel;


async function groundChannel (client, name, data = {}, primary = true) {
    try {
        const channels = await client.guild.channels.fetch();
        name = name == undefined ? 'undefined' : name;
        data.type = data.type == undefined ? 'GUILD_TEXT' : data.type;
        
        if(data.type != 'GUILD_TEXT' && data.type != 'GUILD_VOICE' && 
        data.type != 'GUILD_CATEGORY' && data.type != 'GUILD_NEWS' && 
        data.type != 'GUILD_STORE' && data.type != 'GUILD_NEWS_THREAD' && 
        data.type != 'GUILD_PUBLIC_THREAD' && data.type != 'GUILD_PRIVATE_THREAD' && 
        data.type != 'GUILD_STAGE_VOICE' && data.type != 'UNKNOWN') {
            data.type = 'GUILD_TEXT';
        }
        
        let channel = channels.find(channel => {
            if(channel.name.toString().toLowerCase() === name.toLowerCase() && channel.type.toString() === data.type) return true;
        })

        if(channel){
            await channel.edit(data)
            return channel;
        } else {
            channel = await client.guild.channels.create(name, data);
            return channel;
        }
    } catch (error) {
        log(`Щось пішло не так під час створення каналу \"${name}\"\nПомилка -> ${error}`, 'error');
    }
    
}

module.exports.groundChannel = groundChannel;


async function setSingularMessage(client, channel, message = {}) {
    //init
    const messages = await channel.messages.fetch();
    let singularMessage;

    if(messages.size == 1) { //є одне повідомлення
        if(messages.first().author.id != client.user.id){ //власником повідомлення не є бот
            log(`В каналі ${channel.name} знайдено постороннє повідомлення. Видаляєм його та створюємо своє...`, 'warning')
            await messages.first().delete()
            singularMessage = await channel.send(message)
        } else {
            singularMessage = await messages.first().edit(message)
        }
        
    } else if(messages.size == 0){ //повідомлення немає
        singularMessage = await channel.send(message)
    } else { //повідомлень багато
        let isSended = false;
        log(`В каналі ${channel.name} знайдено посторонні повідомлення. Видаляєм їх та створюємо своє...`, 'warning')
        messages.forEach(async message => {
            if(message.author.id != client.user.id || isSended) {
                await message.delete();
            } else if(message.author.id == client.user.id && !isSended) {
                isSended = true
                singularMessage = message;
            };
        })

        singularMessage.edit(message)
        
    }
    
    return singularMessage;
}

module.exports.setSingularMessage = setSingularMessage;