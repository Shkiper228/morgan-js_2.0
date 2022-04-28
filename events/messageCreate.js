const Event = require('../classes/Event.js');
const log = require('../classes/Logger.js');


const messageCreate = new Event(client, async message => {
    if (message.author.bot || message.channel.type == 'DM' || message.channel.type == 'GROUP_DM') return; //команди від користувачів, які є ботами та повідомлення в дірект або групи не працюватимуть
    log(`<${message.channel.name}> [${message.author.tag}] ${message.content}`, 'message');

    let messageContent = message.content;
    const member = await message.guild.members.fetch(message.author.id);


    //random reaction
    const chance = 5;
    if(Math.ceil(Math.random()*100) <= chance && await client.guild.emojis.cache.size > 0){
        const emojis = await client.guild.emojis.fetch();
        
        message.react(emojis.random());

    } else if(await client.guild.emojis.cache.size == 0) {
        log('На сервері немає емодзі, тому випадкові реакції під повідомленнями неможливі. Якщо ви хочете, аби вона запрацювали - добавте емодзі на сервері', 'warning')
    }

    
    //updateXP
    client.connection.query(`SELECT * FROM members WHERE id = ${message.author.id}`, async (error, rows) => {
        if(rows[0]) {
            const exp = rows[0].experience + Math.floor(Math.random() * 10) + 15;
            if(exp >= (5 * (rows[0].level * rows[0].level) + 50 * rows[0].level + 100)) {
                rows[0].level++;
                const console = await client.guild.channels.fetch('704660113750884433');
                await console.send({
                    content: `${member}`,
                    embeds: [{
                        description: `Ви досягнули ${rows[0].level} рівень! Вітаєм!`,
                        color: '#2D7144'
                    }]
                })
            };
            client.connection.query(`UPDATE members SET experience = ${exp}, level = ${rows[0].level}, messages = ${rows[0].messages + 1} WHERE id = ${message.author.id}`)
        }
    })


    //check adds
    if(messageContent.indexOf('https://discord.gg/') != -1) { //провірка, чи це посилання на діскорд сервер
        log('Знайдено посилання на інший діскорд сервер', 'warning')
        const role = member.roles.highest;
        if(role.toString().toLowerCase() == 'vip' || role.toString().toLowerCase() == 'support'  || role.toString().toLowerCase() == 'underground' || role.toString().toLowerCase() == 'guard' || role.toString().toLowerCase() == 'admin' || role.toString().toLowerCase() == 'redactor' || role.toString().toLowerCase() == 'leader' ){ //дозвіл вищим ролям
            log('Роль з превілегією, якій дозволено надсилати посилання на інший діскорд сервер', 'warning');
            return;
        }

        let isOk = false;

        await message.guild.invites.fetch().then(links => {
            links.forEach(link => {
                if(messageContent.indexOf(link.toString()) != -1){ //все в порядку, це посилання на наш сервер
                    isOk = true
                    log('Все в порядку. Посилання на цей сервер')
                }
        })
        })
        
        const offender = member.user;
        let err = false;
        let banMessage;

        if(!isOk) {
            banMessage = await offender.send({embeds: [{
                description: 'Ви рекламували посторонній діскорд сервер на сервері _Weisttil_, за що вас було автоматично перманентно забанено. Наступного разу уважніше читайте правила!'
            }]})

            try {

                await member.ban({reason: 'Реклама посторонніх діскорд серверів'})
            } catch (error) {
                log(`Не вдалось забанити порушника ${message.author} під ніком ${message.author.username}. Щось пішло не так`, 'error')
                err = true;
                if(banMessage) {
                    await banMessage.delete();
                }
            }

            if(!err) {
                try {
                   await offender.send({embeds: [{
                        description: 'Ви рекламували посторонній діскорд сервер на сервері _Weisttil_, за що вас було автоматично перманентно забанено. Наступного разу уважніше читайте правила!'
                    }]}) 
                } catch (error) {
                    log(`Не вдалось надіслати пояснення порушнику`, 'error');
                }
                await client.owner.send({embeds: [{
                        description: `${message.author} рекламував інший діскорд сервер на сервері _Weisttil_!`
                    }]})
                
            }

            try {



                await message.delete();
            } catch (error) {
                log(`Не вдалось забанити порушника ${message.author} під ніком ${message.author.username}. Щось пішло не так`, 'error')
            }
        

            
        }
        
        
    }
    

    
    
    

    
    //commands handler
    const prefix = client.config.prefix;
    if(messageContent.toLowerCase().startsWith(prefix)) { //команду ідентифіковано
        messageContent = messageContent.slice(prefix.length); //забираємо рефікс

        for (let cname in client.commands) {

            if ((messageContent === cname || messageContent.startsWith(`${cname} `)) && (!client.commands[cname].ownerOnly || member.id == client.owner)) {
      
                let args = messageContent.slice(cname.length).split(' ').filter(el => el != '');

                await client.commands[cname].run(client, message, args);
            } else if((messageContent === cname || messageContent.startsWith(`${cname} `)) && client.commands[cname].ownerOnly) {
                log(`Команда ${cname} доступна лише творцю сервера. Відмовлено у доступі`, 'error')
            }
        }
    }

    /*
    //chat
    if(messageContent.trim().indexOf('<@&868886871948804197>') != -1 || messageContent.trim().indexOf('<@!868884079221809223>') != -1 || messageContent.trim().indexOf('<@868884079221809223>') != -1) {
        log(Math.floor(Math.random() * chat.mention.answers.length))
        await message.channel.send(chat.mention.answers[Math.floor(Math.random() * chat.mention.answers.length)])
    }

    chat.helloWords.triggers.forEach(async trigger => {
        if(messageContent.trim().toLowerCase() == trigger.trim().toLowerCase()){
            log(messageContent.trim().toLowerCase())
            log(trigger.trim().toLowerCase())
            let answer = chat.helloWords.answers.general[Math.floor(Math.random() * chat.helloWords.answers.general.length)];
            await message.channel.send(`${answer[0].toUpperCase()}${answer.slice(1)}`)
        }
    })

    //emotions and actions
    m_a.forEach(async element => {
        if(messageContent.trim().toLowerCase() === element.key.toLocaleLowerCase().trim()) {
            await message.channel.send({ embeds: [{
                description: `${message.author} ${element.answer}`,
                image: {
                    url: 'https://tenor.com/view/%D0%B0%D0%B1%D0%BE%D0%B1%D1%83%D1%81-%D0%B4%D0%B0%D1%88%D0%B0-%D0%BA%D0%BE%D1%80%D0%B5%D0%B9%D0%BA%D0%B0-gif-22153053'
                }
            }]});
            await message.delete();
            log(1);
        }
    })*/
})

module.exports = messageCreate;