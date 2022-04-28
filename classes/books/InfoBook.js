const {MessageEmbed} = require('discord.js');
const path_lib = require('path');
const fs = require('fs');
const log = require('../Logger.js');



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
        const channels = await client.guild.channels.fetch();
        client.infoBooks.push(this);

        const channel = channels.find(channel => {
            if(channel.name.toString().toLowerCase() === this.name.toString().replace(' ', '-').toLowerCase()) return true
        })

        if(channel) {
            this.channel = channel;
            log(`Канал для книги ${this.name} уже є`);
            await channel.edit({
                permissionOverwrites:[
                    {
                        id: this.client.guild.id,
                        allow: 'VIEW_CHANNEL'
                    },
                    {
                        id: this.client.guild.id,
                        deny: 'SEND_MESSAGES'
                    },
                    {
                        id: this.client.guild.id,
                        deny: 'ADD_REACTIONS'
                    }
                ],
                type: 'GUILD_TEXT'
            })
        } else {
            log(`Каналу для книги ${this.name} ще немає. Створюєм...`, 'error')
            await this.client.guild.channels.create(this.name, {permissionOverwrites:[
                {
                    id: this.client.guild.id,
                    allow: 'VIEW_CHANNEL'
                },
                {
                    id: this.client.guild.id,
                    deny: 'SEND_MESSAGES'
                },
                {
                    id: this.client.guild.id,
                    deny: 'ADD_REACTIONS'
                }
            ]})
            .then((channel) => {this.channel = channel; log('Канал створено')})

        }

        const messages = await this.channel.messages.fetch();
        if(messages.size == 1) {
            if(messages.first().author.id != this.client.user.id){
                log(`В каналі для книги ${this.name} знайдено постороннє повідомлення. Видаляєм його та створюємо своє...`, 'error')
                await messages.first().delete()
                this.message = await this.channel.send({embeds: [{
                    title: 'Зміст',
                    description: this.contentPage
                }]})
            } else {
                this.message = await messages.first().edit({embeds: [{
                    title: 'Зміст',
                    description: this.contentPage
                }]})
            }
            
        } else if(messages.size == 0){
            this.message = await this.channel.send({embeds: [{
                title: 'Зміст',
                description: this.contentPage
            }]})
        } else {
            let isSended = false;
            log(`В каналі для книги ${this.name} знайдено посторонні повідомлення. Видаляєм їх та створюємо своє...`, 'error')
            messages.forEach(async message => {
                if(message.author.id != this.client.user.id || isSended) {
                    await message.delete();
                } else if(message.author.id == this.client.user.id && !isSended) {
                    isSended = true
                    this.message = message;
                };
            })

            this.message.edit({embeds: [{
                title: 'Зміст',
                description: this.contentPage
            }]})
        }
        
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