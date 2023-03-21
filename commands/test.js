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
	//log(checkAndConvertOfType('1.1', 'number'));

    /*const channel = message.channel
    await channel.send({embeds: [{
        title: '1._/Контент\\_',
        color: 0x161616,
        description: `1) Заборонено контент порнографічного характеру. Покарання: бан
            2) Заборонено флуд. Новачків, які флудять, караємо баном
            3) Заборонено розповсюдження конфіденційної та чутливої інформації інших людей, без їх дозволу
            4) Заборонено пожирювати потенціно шкідливий та просто шкідливий чи небезпечний софт (віруси) та чіти для ігор. Покарання: бан
            5) На цьому сервері є тематичні текстові канали. Потрібно відправляйти повідомлення у відповідні канали в залежності від вмісту повідомлення. Назва і опис кожного текстового каналу однозначно вказує, для якого вмісту він створений. При порушенні і відхилення прохання видалити нерелевантне повідомлення - видається роль @pig.`
    }]})

    await channel.send({embeds: [{
        title: '2._/Реклама\\_',
        color: 0x161616,
        description: `1) Заборонено розповсюджувати рекламу без дозволу @admin або @leader. Рекламою вважається посилання на інші спільноти будь яких соціальних мереж, блогів
        2) Винятком є \`YouTube\` канали, пов'язані із популяризацією культури, історії, політичного контенту чи науки українською. Такі канали можна поширювати в каналі <#704388054928064652>
        3) Якщо ви бажаєте запропонувати рекламу - звертайтесь до адміністраторів: @leader, @admin, @support`
    }]})*/
})

module.exports = test;