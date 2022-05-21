const Command = require('../classes/Command.js');
const log = require('../classes/Logger.js');
const ErrorAlarm = require('../classes/ErrorAlarm.js');
const { checkAndConvertOfType } = require('../utils/stringAndNumsFormat.js');


const timer = new Command(client, {
    name: 'timer',
    description: 'Створює таймер на указаний час у хвилинах',
    syntax: `${client.config.prefix}timer <час таймера в хвилинах>`,
    ownerOnly: false,
    adminOnly: false
}, async (client, message, args) => {
    if(!checkAndConvertOfType(args[0], 'int')) {
        new ErrorAlarm({
            description: `${message.author} введено не ціле число`,
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