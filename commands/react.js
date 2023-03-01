const Command = require('../classes/Command.js');
const log = require('../classes/Logger.js');
const ErrorAlarm = require('../classes/ErrorAlarm.js');

const react = new Command(client, {
    name: 'react',
    description: 'Використовується щоб бот нажав всі ті реакції, які вже є на повідомленні. Необхідно викликати команду повідомленням як відповідь на повідомлення, на яке бажаєте поставити реакції від імені Моргана',
    syntax: `${client.config.prefix}react`,
    ownerOnly: false,
    adminOnly: false
}, async (client, message, args) => {
    console.log(message.reference)
    if(!message.reference) {
        new ErrorAlarm({
            description: `${message.author} Цю команду треба надсилати із відповіддю на інше повідомлення ${client.config.prefix}${react.name}`,
            channel: message.channel,
            timeout: 10
        })
        return;
    }

    try {
        reference = await message.channel.messages.fetch(message.reference.messageId)
        //console.log(reference.reactions.cache)
        reference.reactions.cache.map(async reaction => {
            //console.log(reaction)
            await reference.react(reaction.emoji)
        });
    } catch (error) {
        new ErrorAlarm({
            description: `${message.author} Не вдалось виконати команду ${client.config.prefix}${react.name}`,
            channel: message.channel,
            timeout: 10
        })
        return;
    }
    


/*
    if(!checkAndConvertOfType(args[0], 'int')) {
        
    }

    let amount = checkAndConvertOfType(args[0], 'int');
    if(Number(args[0]) > 99) {
        new ErrorAlarm({
            description: 'Ви ввели занадто велике значення. Максимальне значення = 99',
            channel: message.channel,
            color: '#FFFF00',
            timeout: 6 
        })
    }*/

})

module.exports = react;