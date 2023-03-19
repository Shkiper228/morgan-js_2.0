const Command = require('../classes/Command.js');
const log = require('../classes/Logger.js');
const ErrorAlarm = require('../classes/ErrorAlarm.js')
const CommandBook = require('../classes/books/CommandBook.js')

const events = new Command(client, {
    name: 'event',
    description: 'Керування івентом',
    syntax: `${client.config.prefix}event`,
    ownerOnly: false,
    adminOnly: true
}, async (client, message, args) => {
    client.connection.query('SELECT * FROM scheduledEventActivities ORDER BY creationTimestamp DESC', (error, rows) => {
        if(error) {
            log('Трапилась помилка при запиті зареєстрованих подій', 'error')
            return
        }

        let list_str = '';
        rows.forEach((event, index) => {
            if(index > 4) return
            list_str += `${index + 1}. \`${event.name}\n\t${event.description}\nРозпочався:\t${new Date(event.creationTimestamp).toLocaleString('uk-UA', { timeZone: 'Europe/Kiev' })}\nЗавершено:\t${event.isEnded == 0 ? '❌' : '✅'}\`\n\n`
        })

        list_str += `\nКількість зареєстрованих подій: ${rows.length}`

        if(rows.length == 0) {
            list_str = 'Покищо немає';
        }

        const eventInfo = new CommandBook(client, message.channel, undefined, 'Список зареєстрованих подій', `Використовуйте реакції, аби перегортати сторінки. Список раніше зареєстрованих подій:\n\n${list_str}\n\tСторінка:0`)
        eventInfo.page = 0;
        eventInfo.eventArray = rows;
        eventInfo.emojis = ['⬅️', '➡️'];
        
        eventInfo.functions.push(async () => {
            //console.log(eventInfo.eventArray)
            if(eventInfo.page < 1) return;
            if(eventInfo.page == 1) {
                eventInfo.page--;
                let list_str = '';
                rows.forEach((event, index) => {
                    if(index > 4) return
                    list_str += `${index + 1}. \`${event.name}\n\t${event.description}\nРозпочався:\t${new Date(event.creationTimestamp).toLocaleString('uk-UA', { timeZone: 'Europe/Kiev' })}\nЗавершено:\t${event.isEnded == 0 ? '❌' : '✅'}\`\n\n`
                })
            
                if(rows.length == 0) {
                    list_str = 'Покищо немає';
                }

                eventInfo.message.edit({embeds: [{
                    title: 'Список зареєстрованих подій',
                    description: `Використовуйте реакції, аби перегортати сторінки. Список раніше зареєстрованих подій:\n\n${list_str}\n\tСторінка:0`
                }]})

                return;
                
            }

            eventInfo.page--;
            const membersDB_list = eventInfo.eventArray[eventInfo.page - 1].info.members
            let members_list_str = '';
            
            
            await membersDB_list.forEach(async memberDB => {
                const member = await message.guild.members.fetch(memberDB.id)
                //console.log(member)
                members_list_str += `\`${member.nickname != null ? member.nickname : member.user.username}:\` ${memberDB.time}хв. \n`
            })
            
            eventInfo.message.edit({embeds: [{
                title: eventInfo.eventArray[eventInfo.page - 1].name,
                description: `Опис: \t\`${eventInfo.eventArray[eventInfo.page - 1].description != undefined ? eventInfo.eventArray[eventInfo.page - 1].description : 'немає'}\`\nДата і час створення: \t\`${eventInfo.eventArray[eventInfo.page - 1].creationTimestamp != undefined ? new Date(eventInfo.eventArray[eventInfo.page - 1].creationTimestamp).toLocaleString('uk-UA', { timeZone: 'Europe/Kiev' }) : 'невідомо'}\`\nСтатус: \t\`${eventInfo.eventArray[eventInfo.page - 1].isEnded == 1 ? 'Завершено❌' : 'Ще триває✅'}\`\n Учасники:\n${members_list_str}\n\n\nСторінка:\t${eventInfo.page}`,
                color: '#004B4B'
            }]})
        })

        eventInfo.functions.push(async () => {
            //console.log(eventInfo.eventArray)
            if(eventInfo.page >= eventInfo.eventArray.length) return;

            eventInfo.page++;
            const membersDB_list = eventInfo.eventArray[eventInfo.page - 1].info.members
            let members_list_str = '';
            
            
            await membersDB_list.forEach(async memberDB => {
                const member = await message.guild.members.fetch(memberDB.id)
                //console.log(member)
                members_list_str += `\`${member.nickname != null ? member.nickname : member.user.username}:\` ${memberDB.time}хв. \n`
            })
            
            eventInfo.message.edit({embeds: [{
                title: eventInfo.eventArray[eventInfo.page - 1].name,
                description: `Опис: \t\`${eventInfo.eventArray[eventInfo.page - 1].description != undefined ? eventInfo.eventArray[eventInfo.page - 1].description : 'немає'}\`\nДата і час створення: \t\`${eventInfo.eventArray[eventInfo.page - 1].creationTimestamp != undefined ? new Date(eventInfo.eventArray[eventInfo.page - 1].creationTimestamp).toLocaleString('uk-UA', { timeZone: 'Europe/Kiev' }) : 'невідомо'}\`\nСтатус: \t\`${eventInfo.eventArray[eventInfo.page - 1].isEnded == 1 ? 'Завершено❌' : 'Ще триває✅'}\`\n Учасники:\n${members_list_str}\n\n\nСторінка:\t${eventInfo.page}`,
                color: '#004B4B'
            }]})
        })

        eventInfo.start()
    })


    /*client.connection.query('SELECT * FROM scheduledEventActivities LIMIT 1', async (error, rows) => {
        const event = rows[0]
        if(rows[0]) { //if exists


            const membersDB_list = event.info.members
            let members_list_str = '';
            
            
            await membersDB_list.forEach(async memberDB => {
                const member = await message.guild.members.fetch(memberDB.id)
                console.log(member)
                members_list_str += `\`${member.nickname != null ? member.nickname : member.user.username}:\` ${memberDB.time}хв. \n`
            })

            //console.log(`Рядок із учасниками: ${members_list_str}`)

            await message.channel.send({embeds: [{
                title: `Остання подія: \`${event.name != undefined ? event.name : 'невідомо'}\``,
                description: `Опис: \t\`${event.description != undefined ? event.description : 'немає'}\`\nДата і час створення: \t\`${event.creationTimestamp != undefined ? new Date(event.creationTimestamp).toLocaleString('uk-UA', { timeZone: 'Europe/Kiev' }) : 'невідомо'}\`\nСтатус: \t\`${event.isEnded == 1 ? 'Завершено❌' : 'Ще триває✅'}\`\n Учасники:\n${members_list_str}`,
                color: '#004B4B'
            }]})
            /*message.guild.members.fetch({ user: idsList})
                .then(async members_list => {
                    
                    members_list = Array.from(members_list)
                    console.log(members_list)
                    let members_list_str = '';

                    await membersDB_list.forEach(async (member, index) => {
                        members_list_str += `\`${await members_list[index].nickname}:\` ${member.time}хв. \n`
                    });
                
                    await message.channel.send({embeds: [{
                        title: `Остання подія: \`${event.name != undefined ? event.name : 'невідомо'}\``,
                        description: `Опис: \t\`${event.description != undefined ? event.description : ''}\`\nДата і час створення: \t\`${event.creationTimestamp != undefined ? new Date(event.creationTimestamp).toLocaleString('uk-UA', { timeZone: 'Europe/Kiev' }) : 'невідомо'}\`\nСтатус: \t\`${event.isEnded == 1 ? 'Завершено❌' : 'Ще триває✅'}\`\n Учасники:\n${members_list_str}`,
                        color: '#004B4B'
                    }]})
                })
        } else {
            new ErrorAlarm({

                description: 'Не знайдено подій в базі даних',
                channel: message.channel,
                color: '#F4CA16'
            })
            return;
        }
        
    })*/

    
})

module.exports = events;