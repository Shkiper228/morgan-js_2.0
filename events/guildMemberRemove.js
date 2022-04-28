const Event = require('../classes/Event.js');
const log = require('../classes/Logger.js');
const findOrCreateChannel = require('../utils.js').findOrCreateChannel;

function formatCurrentDateTime() {
    const date = new Date();
    const days = date.getDate() < 10 ? `0${date.getDate()}` : `${date.getDate()}`;
    const months = date.getMonth() < 9 ? `0${date.getMonth() + 1}` : `${date.getMonth()+ 1}`;

    const seconds = date.getSeconds() < 10 ? `0${date.getSeconds()}` : `${date.getSeconds()}`;
    const minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : `${date.getMinutes()}`;
    const hours = date.getHours() < 10 ? `0${date.getHours()}` : `${date.getHours()}`;

    return `${days}.${months}.${date.getFullYear()} ${hours}:${minutes}:${seconds}`;
}

const guildMemberRemove = new Event(client, async (member) => {
    const channel = await findOrCreateChannel(client, '📗users');
    await channel.edit({
        permissionOverwrites:[
            {
                id: client.guild.id,
                allow: 'VIEW_CHANNEL'
            },
            {
                id: client.guild.id,
                deny: 'SEND_MESSAGES'
            },
            {
                id: client.guild.id,
                deny: 'ADD_REACTIONS'
            }
        ],
        type: 'GUILD_TEXT'
    })
    channel.send({embeds: [{
        description: `${member} під іменем ${member.user.tag} покинув сервер о ${formatCurrentDateTime()}\n`,
        color: '#aa0000'
    }]});

    /*channel.send({embeds: [{
        description: `Ласкаво просимо на сервері, ${member}! Ти уже ${member.guild.memberCount}-й\nПрочитай правила ${}`
    }]})*/
});

module.exports = guildMemberRemove;