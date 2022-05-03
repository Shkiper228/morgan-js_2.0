const { createCanvas, loadImage } = require('canvas');
const { MessageAttachment } = require('discord.js')
const Command = require('../classes/Command.js');
const log = require('../classes/Logger.js');
const { fillRectRadius } = require('../utils.js');


async function formatRankCard(client, canvas, message) {
    //initialization
    const member = await client.guild.members.fetch(message.author.id);
    const context = canvas.getContext('2d');
    context.font = '28px sans-serif';
    const padding = 10;
    

    //background
    context.fillStyle = "rgb(30,30,30)";
    context.fillRect(0, 0, canvas.width, canvas.height);

    //rounded rect
    context.fillStyle = "rgb(0,62,62)";
    fillRectRadius(context, padding, padding, canvas.width - padding * 2, canvas.height - padding * 2, 8);

    //place and rounding avatar
    const avatar = await loadImage(member.user.displayAvatarURL({ format: 'jpg' }));
    context.drawImage(avatar, padding * 2 + 5, padding * 2 + 5);

    //progress bar
    let expForNextLvl = 0, expForLastLvl = 0, expForNextLvlSimple = 0, exp = 0, expSimple = 0;
    client.connection.query(`SELECT * FROM members`, async (error, rows) => {
        let indexAuthor;

        const unsortedArr = [];
        const sortedArr = [];

        rows.forEach(row => {
            unsortedArr.push(row);
        })

        let indexMax;

        for (let i = 0; i < rows.length; i++) {
            for (let n = 0; n < unsortedArr.length; n++) {
                if (indexMax == undefined || unsortedArr[indexMax].experience < unsortedArr[n].experience) indexMax = n;
            }

            sortedArr.push(unsortedArr[indexMax])

            if (unsortedArr[indexMax].id == message.author.id) indexAuthor = sortedArr.length - 1;

            unsortedArr.splice(indexMax, 1);
            indexMax = undefined;
        }

        expForNextLvl = (5 * Math.pow(sortedArr[indexAuthor].level + 1, 2)) + (50 * (sortedArr[indexAuthor].level + 1)) + 100;
        for(let i = 0; i < sortedArr[indexAuthor].level; i++){
            expForLastLvl += (5 * Math.pow(i, 2)) + (50 * i) + 100;
        }

        exp = sortedArr[indexAuthor].experience;
        expSimple = exp - expForLastLvl;
            
        context.fillStyle = "rgb(80, 200, 120)";
        for(let i = 0; i < 19; i++) {
            if((expForNextLvl / 19) * i > expSimple) context.fillStyle = "rgb(37,37,37)";
            context.fillRect(padding * 2 + i * 25, canvas.height - 38, 20, 20);
        }

        context.fillStyle = "rgb(180,180,180)";
        context.fillText(`${expSimple}/${expForNextLvl}`, canvas.width - padding * 2 - 116, canvas.height - padding * 2 - 5);
        context.fillText(`${message.author.tag}`, padding * 2 + 5, padding * 2 + avatar.height + 40);
        context.fillText('Ваш рейтинг:', padding * 2 + 5 + avatar.width + 15, padding * 2 + 28);
        context.fillStyle = "rgb(255,255,255)";
        context.font = '44px sans-serif';
        context.fillText(`#${indexAuthor + 1}`, padding * 2 + 5 + avatar.width + 220, padding * 2 + 33);

        context.fillStyle = "rgb(180,180,180)";
        context.font = '28px sans-serif';
        context.fillText('Рівень: ', padding * 2 + 5 + avatar.width + 310, padding * 2 + 28)
        context.fillStyle = "rgb(255,255,255)";
        context.font = '44px sans-serif';
        context.fillText(`${sortedArr[indexAuthor].level}`, padding * 2 + 5 + avatar.width + 415, padding * 2 + 33)

        context.fillStyle = "rgb(180,180,180)";
        context.font = '28px sans-serif';
        context.fillText(`Досвід: ${sortedArr[indexAuthor].experience}`, padding * 2 + 5 + avatar.width + 15, padding * 2 + 90)
        context.fillText(`Повідомлення: ${sortedArr[indexAuthor].messages}`, padding * 2 + 5 + avatar.width + 210, padding * 2 + 95)

        //format message
        const attachment = new MessageAttachment(canvas.toBuffer(), 'profile-image.png');
        await message.channel.send({
            files: [attachment]
        })
    })
}

const rank = new Command(client, {
    name: 'rank',
    description: 'Команда для відображення досвіду, рівня та рейтингу',
    ownerOnly: false,
    adminOnly: false
}, async (client, message, args) => {
    const canvas = createCanvas(640, 240)
    formatRankCard(client, canvas, message);
})

module.exports = rank;