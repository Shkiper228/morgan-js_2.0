const {MessageEmbed, MessageActionRow, MessageButton} = require('discord.js');
const cutNum = require('../utils.js').cutNum;
const Command = require('../classes/Command.js');
const log = require('../classes/Logger.js');

const test = new Command(client, {
    name: 'test',
    description: 'Тестова команда. Лише для розробника',
    ownerOnly: true,
    adminOnly: false
}, async (client, message, args) => {
    console.log(await client.guild.channels.fetch('704384154925662280'))
})

module.exports = test;