const Book = require('./Book.js');
const {MessageButton} = require('discord.js');

class CommandBook {
    constructor ({client, channel, title, text, buttons}) {
        super(client, channel_id);
        this.channel = channel;
        this.title = title;
        this.description = text;
        this.functions = [];
        this.buttons = [];
        buttons.forEach(button => {
            const button = new MessageButton()
            .setLabel()
            .setStyle()
            .setCustomId(`${client.commandBooks.length - 1}${this.buttons.length - 1}`)
            this.buttons.push(new MessageButton({}))
        });

        this.index = client.commandBooks.length - 1;
        
        this.start()
    }

    async start () {
        client.commandBooks.push(this);
        this.message = await this.channel.send({embeds: [{
            title: this.name,
            description: this.description
        }]})

        for(let i = 0; i < this.functions.length; i++) {
            this.message.react(this.emojis[i]);
        }
    }

    async delete() {
        this.message.delete();
        this.client.commandBooks.splice(this.index, this.index);
        
    }
}

module.exports = CommandBook;