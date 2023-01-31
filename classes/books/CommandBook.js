const {MessageEmbed} = require('discord.js');
const fs = require('fs');
const log = require('../Logger.js');
const Book = require('./Book.js');


class CommandBook extends Book {
    constructor (client, channel, message, name, text ) {
        super(client, channel.id);
        this.channel = channel;
        this.message = message;
        this.name = name;
        this.description = text;
        this.functions = [];
        this.temp = {};

        if(!client.commandBooks) client.commandBooks = [];
        this.index = client.commandBooks.length;
        client.commandBooks.push(this);
    }

    async start () {
        if(!this.message){
            this.message = await this.channel.send({embeds: [{
                title: this.name,
                description: this.description
            }]})
        } else {
            this.message = await this.message.edit({embeds: [{
                title: this.name,
                description: this.description
            }]})
        }
        

        for(let i = 0; i < this.functions.length; i++) {
            this.message.react(this.emojis[i]);
        }
    }

    async delete(options = { message: true }) {
        await this.message.reactions.removeAll();
        if(options.message) await this.message.delete();
        this.client.commandBooks.splice(this.index, this.index);
    }
}

module.exports = CommandBook;