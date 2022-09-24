const Event = require('../classes/Event.js');

const disconnect = new Event(client, async () => {
    client.connection.end();
});

module.exports = disconnect;