const Command = require('../classes/Command.js');
const log = require('../classes/Logger.js');


const rank = new Command(client, {
    name: 'rank',
    description: 'Команда для допомоги з командами(яку ви щойно написали)',
    ownerOnly: false,
    adminOnly: false
}, async (client, message, args) => {
    const member = await client.guild.members.fetch(message.author.id);
    client.connection.query(`SELECT * FROM members WHERE id = ${message.author.id}`, async (error, rows) => {
        message.channel.send({
            embeds: [{
                title: `Ранг ${member}`,
                description: `Досвід: ${rows[0].experience}\nРівень: ${rows[0].level}`
            }]
        })
    })
})

module.exports = rank;