const Event = require('../classes/Event.js');
const log = require('../classes/Logger.js');
const {MessageEmbed} = require('discord.js');
const findOrCreateChannel = require('../utils.js').findOrCreateChannel;

const guildMemberAdd = new Event(client, async (member) => {
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
    const embed = new MessageEmbed()
    .setImage(member.displayAvatarURL())
    .setDescription(`Ласкаво просимо на сервері, ${member}! Новачок під іменем ${member.user.tag} уже ${member.guild.memberCount}-й\n`)
    .setColor('#00aa00')

    await channel.send({embeds: [embed]});

    /*channel.send({embeds: [{
        description: `Ласкаво просимо на сервері, ${member}! Ти уже ${member.guild.memberCount}-й\nПрочитай правила ${}`
    }]})*/
});

module.exports = guildMemberAdd;