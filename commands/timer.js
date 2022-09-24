const Command = require('../classes/Command.js');
const log = require('../classes/Logger.js');
const ErrorAlarm = require('../classes/ErrorAlarm.js');
const { checkAndConvertOfType } = require('../utils/stringAndNumsFormat.js');
const Timer = require('../classes/Timer.js');


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
        });
        return;
    } else if(Number(args[0]) >= (Math.pow(2, 31) - 1) / 60000) {
        new ErrorAlarm({
            description: `${message.author} введіть менше число. Максимальна кількість хвилин для таймеру - ${Math.floor((Math.pow(2, 31) - 2) / 60000)}`,
            channel: message.channel
        });
        return;
    }
    const timer = new Timer(client, args[0], message.channel.id, 'Таймер', `Твій таймер на ${args[0]} хвилин спрацював`, `${message.author}`, '553344');

    await message.channel.send({
        embeds: [{
            description: `${message.author} твій таймер на ${args[0]} хвилин запущено\nВін спрацює о: \`${timer.formedDateTime}\``
        }]
    })
})

module.exports = timer;