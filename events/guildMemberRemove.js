const Event = require('../classes/Event.js');
const log = require('../classes/Logger.js');

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
    client.users_channel.send({embeds: [{
        description: `${member} під іменем ${member.user.tag} покинув сервер о ${formatCurrentDateTime()}\n`,
        color: '#aa0000'
    }]});
});

module.exports = guildMemberRemove;