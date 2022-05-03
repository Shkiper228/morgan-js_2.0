const { createCanvas, loadImage } = require('canvas');
const { MessageAttachment } = require('discord.js')
const ErroAlarm = require('../classes/ErrorAlarm.js')
const Command = require('../classes/Command.js');
const log = require('../classes/Logger.js');
const { fillRectRadius, cutNum } = require('../utils.js');


async function formatRankCard(client, canvas, member, message) {
    //initialization
    const context = canvas.getContext('2d');
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

            if (unsortedArr[indexMax].id == member.id) indexAuthor = sortedArr.length - 1;

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
        for(let i = 0; i < 18; i++) {
            if((expForNextLvl / 18) * i > expSimple) context.fillStyle = "rgb(37,37,37)";
            context.fillRect(padding * 2 + i * 25, canvas.height - 38, 20, 20);
        }

        context.font = '28px sans-serif';
        context.fillStyle = "rgb(180,180,180)";
        context.fillText(`${cutNum(expSimple)}/${cutNum(expForNextLvl)}`, canvas.width - padding * 2 - 145, canvas.height - padding * 2 - 5);
        context.fillText(`${member.user.tag}`, padding * 2 + 5, padding * 2 + avatar.height + 40);
        context.font = '27px sans-serif';
        context.fillText('Ваш рейтинг:', padding * 2 + 5 + avatar.width + 15, padding * 2 + 28);
        context.fillStyle = "rgb(255,255,255)";
        context.font = '44px sans-serif';
        context.fillText(`#${cutNum(indexAuthor + 1)}`, padding * 2 + 5 + avatar.width + 220, padding * 2 + 33);

        context.fillStyle = "rgb(180,180,180)";
        context.font = '27px sans-serif';
        context.fillText('Рівень: ', padding * 2 + 5 + avatar.width + 310, padding * 2 + 28)
        context.fillStyle = "rgb(255,255,255)";
        context.font = '44px sans-serif';
        context.fillText(`${cutNum(sortedArr[indexAuthor].level)}`, padding * 2 + 5 + avatar.width + 415, padding * 2 + 33)

        context.fillStyle = "rgb(180,180,180)";
        context.font = '24px sans-serif';
        context.fillText(`Досвід: ${cutNum(sortedArr[indexAuthor].experience)}`, padding * 2 + 5 + avatar.width + 15, padding * 2 + 90)
        context.fillText(`Повідомлення: ${cutNum(sortedArr[indexAuthor].messages)}`, padding * 2 + 5 + avatar.width + 210, padding * 2 + 95)

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
    let member;
    if (!args[0]) {
        member = await client.guild.members.fetch(message.author.id);
        
    } else {
        try {
            member = await client.guild.members.fetch(args[0]);
            if(member.user.bot) {
                new ErroAlarm ({
                    description: `${message.author} не можна генерувати картку рейтингу для ботів, так як їх досвід не фіксується в базі даних`, 
                    channel: message.channel
                })
                return;
            }
        } catch (error) {
            new ErroAlarm({
                description: `${message.author} на жаль такого користувача немає на цьому сервері`,
                channel: message.channel
            })
            return;
        }
    }
    const canvas = createCanvas(640, 240)
    formatRankCard(client, canvas, member, message);
})

module.exports = rank;