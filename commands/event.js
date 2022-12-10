const Command = require('../classes/Command.js');
const log = require('../classes/Logger.js');
const ErrorAlarm = require('../classes/ErrorAlarm.js');
const { checkAndConvertOfType } = require('../utils/stringAndNumsFormat.js');

const event = new Command(client, {
    name: 'event',
    description: 'Керування івентом',
    syntax: `${client.config.prefix}event`,
    ownerOnly: false,
    adminOnly: true
}, async (client, message, args) => {
    const member = await client.guild.members.fetch(message.author.id);
    const roles = member.roles;

    const end_hours = 4



})

module.exports = event;