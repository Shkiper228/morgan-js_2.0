const Command = require('../classes/Command.js');
const log = require('../classes/Logger.js')

const timer = new Command(client, {
    name: 'timer',
    description: 'Створює таймер на указаний час у хвилинах',
    syntax: `${client.config.prefix}timer <час таймера в хвилинах>`,
    ownerOnly: false,
    adminOnly: false
}, async (client, message, args) => {
    if(Number(args[0]) % 1 != 0) {
        await message.delete();
        new ErrorAlarm({
            description: 'Введено не ціле число',
            channel: message.channel
        })
        return;
    }

    if(Number(args[0]) == NaN) {
        await message.delete();
        new ErrorAlarm({
            description: 'Введено не ціле число',
            channel: message.channel
        })
        return;
    }


    await message.channel.send({
        embeds: [{
            description: `${message.author} твій таймер на ${args[0]} хвилин запущено`
        }]
    })

    setTimeout(() => {
        message.channel.send({
            content: `${message.author}`,
            embeds: [{
                description: `Твій таймер на ${args[0]} хвилин спрацював!`
            }]})
    }, args[0] * 1000 * 60)
})

module.exports = timer;