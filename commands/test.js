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
    ownerOnly: false,
    adminOnly: false
}, async (client, message, args) => {
	log(checkAndConvertOfType('1.1', 'number'));
})

module.exports = test;