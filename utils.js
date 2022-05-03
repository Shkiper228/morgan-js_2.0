const log = require('./classes/Logger.js');
const { createCanvas } = require('canvas');

function cutNum(num) {
    if(num >= 1000000) {
        return `${Math.floor(num / 100000) / 10}M`;
    } else  if(num >= 1000) {
        return `${Math.floor(num / 100) / 10}K`;
    } else {
        return num;
    }
}

module.exports.cutNum = cutNum;

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

function strokeRectRadius(context, x, y, width, height, radius) {
    context.fillRect(x, y + radius, width, height - 2 * radius);
    context.fillRect(x + radius, y, width - 2 * radius, height);
    context.beginPath();
    context.moveTo(x, y + radius);
    context.arcTo(x, y + height, x + radius, y + height, radius);
    context.arcTo(x + width, y + height, x + width, y + height - radius, radius);
    context.arcTo(x + width, y, x + width - radius, y, radius);
    context.arcTo(x, y, x, y + radius, radius);
    context.stroke();
}

module.exports.strokeRectRadius = strokeRectRadius;


function fillRectRadius(context, x, y, width, height, radius) {
    context.beginPath();
    context.moveTo(x, y + radius);
    context.arcTo(x, y + height, x + radius, y + height, radius);
    context.arcTo(x + width, y + height, x + width, y + height - radius, radius);
    context.arcTo(x + width, y, x + width - radius, y, radius);
    context.arcTo(x, y, x, y + radius, radius);
    context.fill();
}

module.exports.fillRectRadius = fillRectRadius;