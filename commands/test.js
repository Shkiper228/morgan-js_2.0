const Command = require('../classes/Command.js');
const {MessageEmbed, MessageActionRow, MessageButton} = require('discord.js')
const log = require('../classes/Logger.js');

const test = new Command(client, {
    name: 'test',
    description: 'Тестова команда. Лише для розробника',
    ownerOnly: true,
    adminOnly: false
}, async (client, message, args) => {
    const row = new MessageActionRow({
        components: [new MessageButton({
            label: 'test',
            style: 'DANGER',
            customId: 'TEST'
        })]
    })

    message.channel.send({
        content: '1',
        components: [row]
    })
})

module.exports = test;