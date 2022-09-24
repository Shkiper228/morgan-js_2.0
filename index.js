const Morgan = require('./classes/Morgan.js');
const log = require('./classes/Logger.js');

client = new Morgan();

client.on('ready', () => {
    log(`Logged as ${client.user.tag}`)
    client.init();
})

client.login();