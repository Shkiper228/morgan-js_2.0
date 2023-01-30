const log = require('../classes/Logger.js');

class ScheduledEventHandler{
    constructor(client, guild, scheduledEvent) {
        this.client = client;
        this.guild = guild;
        this.scheduledEvent = scheduledEvent;

        this.init()
    }

    init () {
        this.client.connection.query(`INSERT INTO scheduledEventActivities (id, name, creationTimestamp, info) VALUES(${this.scheduledEvent.id}, \"${this.scheduledEvent.name}\", ${Date.now() / 1000}, '{\"members\": []}')`)

        this.loop = setInterval(this.handler.bind(this), 6000/*0*/);
    }

    handler () {
        if(this.scheduledEvent.isActive()) {
            const members = this.scheduledEvent.channel.members;
            let dbInfo;
            this.client.connection.query(`SELECT * FROM scheduledEventActivities WHERE id = ${this.scheduledEvent.id}`, (errors, rows) => {
                dbInfo = rows[0].info;
                let handlered_info = dbInfo;
                console.log(dbInfo.members)

                members.forEach(member => {
                    let searched_member = handlered_info.members.find(dbMember => member.user.id == dbMember.id ? true : undefined)

                    if(searched_member) {
                        searched_member.time++
                    } else {
                        handlered_info.members.push({id: member.user.id, time: 0})
                        handlered_info.members[handlered_info.members.length-1].time++;
                    }
                });

                handlered_info = JSON.stringify(handlered_info)
                //console.log(handlered_info);
                this.client.connection.query(`UPDATE scheduledEventActivities SET info = '${handlered_info}' WHERE id = ${this.scheduledEvent.id}`)
            })

        } else {
            this.client.connection.query(`UPDATE scheduledEventActivities SET isEnded = 1 WHERE id = ${this.scheduledEvent.id}`)

            clearInterval(this.loop);
        }
    }
}

module.exports = ScheduledEventHandler;