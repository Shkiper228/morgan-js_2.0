const { MessageActionRow, MessageEmbed} = require('discord.js');
const Command = require('../classes/Command.js');

const random = new Command(client, {
    name: 'random',
    description: 'Повертає випадкове ціле число з указаного діапазону',
    ownerOnly: false,
    adminOnly: false
}, async (client, message, args) => {
    if (args.length != 2) {
        message.channel.send({embeds: [{
            description: `${message.member}, необхідно вказати _два_ цілих числа`,
            color: '#940000'
        }]})
        return;
    }

    try {
        min = args[0] < args[1] ? Number(args[0]) : Number(args[1]);
        max = args[0] > args[1] ? Number(args[0]) : Number(args[1]);
    } catch (error) {
        message.channel.send({embeds: [{
            description: `${message.member}, потрібно вказати два _цілих числа_`,
            color: '#940000'
        }]})
        return;
    }


    if (String(min) === 'NaN' || String(max) === 'NaN') {
        message.channel.send({embeds: [{
            description: `${message.member}, потрібно вказати два _цілих числа_`,
            color: '#940000'
        }]})
        return;
    }
    
    message.channel.send({embeds: [{
        description: `${message.member} випадкове число --> ${Math.floor(Math.random() * (max-min + 1) + min)}`
    }]})
})

module.exports = random;