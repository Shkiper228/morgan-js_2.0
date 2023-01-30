const Event = require('../classes/Event.js');
const log = require('../classes/Logger.js');
const ScheduleEventHandler = require('../classes/ScheduleEventHandler.js');

const guildScheduledEventUpdate = new Event(client, async (oldGuildScheduledEvent, newGuildScheduledEvent) => {
    if(!oldGuildScheduledEvent.channel) return;


    //log(`Оновлено подію. Стан до оновлення: ${oldGuildScheduledEvent.isActive()}; Після: ${newGuildScheduledEvent.isActive()}`, 'warning');

    if(!oldGuildScheduledEvent.isActive() && newGuildScheduledEvent.isActive()) {
        log(`Подію розпочато. Назва ${newGuildScheduledEvent.name}`, 'warning');
        new ScheduleEventHandler(client, newGuildScheduledEvent.guild, newGuildScheduledEvent);
    }
})

module.exports = guildScheduledEventUpdate;