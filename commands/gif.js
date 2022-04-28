const Command = require('../classes/Command.js');
const fetch = require('node-fetch');
const log = require('../classes/Logger.js');
const ErrorAlarm = require('../classes/ErrorAlarm.js')

const gif = new Command(client, {
    name: 'gif',
    description: 'Команда для пошуку гіфок',
    syntax: `${client.config.prefix}gif <назва для пошуку>`,
    ownerOnly: false,
    adminOnly: false
}, async (client, message, args) => {
    let tenor_key;
    try {
        tenor_key = require('../secret.json').tenor_key;
    } catch {
        tenor_key = process.env.tenor_key;
    }


    const response = await fetch(`https://api.tenor.com/v1/search?q=${args}&key=${tenor_key}&limit=4`);
    const result = await response.json();
    if(result.results.length == 0) {
        new ErrorAlarm({

            description: args.length >= 2 ? `Немає результатів на ваш запит за ключовими словами \`${args.join(', ')}\` ` : `Немає результатів на ваш запит за ключовим словом \`${args[0]}\` `,
            channel: message.channel,
            color: '#F4CA16'
        })
        return;
    }
    const index = Math.floor(Math.random() * result.results.length);

    message.channel.send(result.results[index].url);
})

module.exports = gif;