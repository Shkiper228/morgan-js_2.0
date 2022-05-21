const {MessageEmbed} = require('discord.js');
const path_lib = require('path');
const fs = require('fs');
const log = require('../Logger.js');
const { groundChannel, setSingularMessage } = require('../../utils/channelsUtils.js')



class InfoBook {
    constructor ({client, folder_path}) {
        this.client = client;
        this.name = path_lib.basename(folder_path) ;
        this.pages = [];
        this.files = [];
        this.contentPage = '0 - Зміст\n';

        //формування сторінок
        fs.readdirSync(`${folder_path}`).forEach(file => {
            this.files.push(file.toString());
            this.pages.push([]);

            const strs = fs.readFileSync(`${folder_path}/${file.toString()}`).toString().split('\n');
            
            strs.forEach(stroke => {
                this.pages[this.pages.length - 1].push(stroke);
            })
        })

        //формування змістової сторінки
        for(let i = 0; i < this.files.length; i++){
            this.contentPage += `${i + 1} - ${this.files[i].slice(0, this.files[i].length - 4)}\n`
        }

        this.length = this.pages.length;
        this.index = client.InfoBook.length;
        this.start();
    }

    emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '0️⃣'];

    async start () {
        this.channel = await groundChannel(this.client, this.name.toString().replace(' ', '-'));
        this.channel.permissionOverwrites.create(this.client.guild.roles.everyone, {
			'VIEW_CHANNEL': true,
			'SEND_MESSAGES': false,
			'ADD_REACTIONS': false
		})

        this.message = await setSingularMessage(this.client, this.channel, {embeds: [{
            title: 'Зміст',
            description: this.contentPage
        }]})
        client.infoBooks.push(this);


        
        
        await this.message.reactions.removeAll();
        await this.message.react(this.emojis[this.emojis.length - 1]);

        for(let i = 0; i < this.length; i++){
            this.message.react(this.emojis[i]);
        }
    }

    changePage (pageNumber) {
        if(pageNumber != this.currentPage) {
            if(pageNumber == this.emojis.length - 1) {
                this.message.edit({embeds: [{
                    title: 'Зміст',
                    description: this.contentPage
                }]});
            } else {
                const embed = new MessageEmbed({
                    title: this.files[pageNumber].slice(0, -4),

                })
                this.pages[pageNumber].forEach((page, index) => {
                    embed.addField(`_-|${index + 1}|-_`, page);
                })

                this.message.edit({embeds: [embed]});
            }

            this.currentPage = pageNumber;
        }
    }
}

module.exports = InfoBook;