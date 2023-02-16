const { createCanvas, loadImage } = require('canvas');
const Command = require('../classes/Command.js');
const { MessageAttachment } = require('discord.js')
const { ChannelType } = require('discord.js')
const log = require('../classes/Logger.js');
const { fillRectRadius } = require('../utils/canvasUtils.js');
const { groundChannel } = require('../utils/channelsUtils.js');
const fetch = require('node-fetch');
const { stringAndNumsFormat, checkAndConvertOfType } = require('../utils/stringAndNumsFormat.js');


const test = new Command(client, {
    name: 'test',
    description: 'Тестова команда',
    ownerOnly: true,
    adminOnly: false,
    enable: true
}, async (client, message, args) => {
	log(checkAndConvertOfType('1.1', 'number'));

    const guild = message.guild
    const administrators = [];
    const leader = await guild.roles.fetch(client.config.leader)
    administrators[0] = leader.members
    administrators[0].forEach(member => {
        if(bumper.slice(2,-1) != member.id.toString()) {
            member.send({embeds: [{
                description: 'Якщо ти побачив(-ла) це повідомлення - напиши мені (Шкіперу). Я тестую модифікацію системи бамп сповіщень'
            }]})
        }
    })    
    const admin = await guild.roles.fetch(client.config.admin)
    administrators[1] = admin.members
    administrators[1].forEach(member => {
        if(bumper.slice(2,-1) != member.id.toString()) {
            member.send({embeds: [{
                description: 'Якщо ти побачив(-ла) це повідомлення - напиши мені (Шкіперу). Я тестую модифікацію системи бамп сповіщень'
            }]})
        }
    })
    const support = await guild.roles.fetch(client.config.support)
    administrators[2] = support.members
    administrators[2].forEach(member => {
        if(bumper.slice(2,-1) != member.id.toString()) {
            member.send({embeds: [{
                description: 'Якщо ти побачив(-ла) це повідомлення - напиши мені (Шкіперу). Я тестую модифікацію системи бамп сповіщень'
            }]})
        }
    })            
})

module.exports = test;