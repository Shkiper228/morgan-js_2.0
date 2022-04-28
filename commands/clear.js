const Command = require('../classes/Command.js');
const log = require('../classes/Logger.js');
const ErrorAlarm = require('../classes/ErrorAlarm.js');

const clear = new Command(client, {
    name: 'clear',
    description: 'Команда для масового видалення повідомлень',
    syntax: `${client.config.prefix}clear <ціле число кількості повідомлень>`,
    ownerOnly: false,
    adminOnly: false
}, async (client, message, args) => {
    const member = await client.guild.members.fetch(message.author.id);
    const roles = member.roles;
    if(roles.highest.name.toString() != 'leader' && roles.highest.name.toString() != 'admin' && roles.highest.name.toString() != 'support') return;

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

    let amount = Number(args[0]);
    if(Number(args[0]) > 99) {
        amount = 99;
        new ErrorAlarm({
            description: 'Ви ввели занадто велике значення. Максимальне значення = 99',
            channel: message.channel,
            color: '#FFFF00',
            timeout: 6 
        })
    }

    if(!args[0] || Number(args[0]) < 0) amount = 0;

    await message.channel.bulkDelete(amount + 1, true);
})

module.exports = clear;