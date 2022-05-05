const { Client, Intents } = require('discord.js');
const log = require('../classes/Logger.js');
const findOrCreateChannel = require('../utils.js').findOrCreateChannel;
const fs = require('fs');
const mysql = require('mysql');
const InfoBook = require('../classes/books/InfoBook.js');


class Morgan extends Client {
    constructor () {
        super({
            intents: [
				Intents.FLAGS.GUILDS,
				Intents.FLAGS.GUILD_MEMBERS,
				Intents.FLAGS.GUILD_MESSAGES,
				Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
				Intents.FLAGS.GUILD_VOICE_STATES,
				Intents.FLAGS.DIRECT_MESSAGES
			],
			allowedMentions: {
				parse: ["users"]
            }
        })

        this.config = require('../config.json').general;
		
		this.InfoBook = [];
    }

	async init() {
		this.guild = await this.guilds.fetch(this.config.guild);
		log(`Кількість емодзі: ${await this.guild.emojis.cache.size}`)
		this.owner = await this.guild.members.fetch('506215900836265995');

		await this.loadCommands();
		await this.loadEvents();
		await this.loadInfoBooks();
		await this.dbConnection();


		this.begin_channel = await findOrCreateChannel(client, 'welcome')
		await this.begin_channel.edit({
			permissionOverwrites:[
				{
					id: this.guild.id,
					deny: 'SEND_MESSAGES'
				},
				{
					id: this.guild.id,
					deny: 'ADD_REACTIONS'
				},
				{
					id: '704691487857704980',
					deny: 'VIEW_CHANNEL'
				},
				{
					id: '713001961108144129',
					deny: 'VIEW_CHANNEL'
				},
				{
					id: '704385560436932679',
					deny: 'VIEW_CHANNEL'
				}
			],
			type: 'GUILD_TEXT'
		})

		const messages = await this.begin_channel.messages.fetch();
		let begin_message;
        if(messages.size == 1) {
            if(messages.first().author.id != this.user.id){
                log(`В каналі для книги ${this.name} знайдено постороннє повідомлення. Видаляєм його та створюємо своє...`, 'error')
                await messages.first().delete()
                begin_message = await this.begin_channel.send({embeds: [{
                    title: 'Верифікація',
                    description: 'Ласкаво просимо на сервері! \nВи новачок, тож не верифіковані і не можете повноцінно перебувати на сервері.\nЩоб верифікуватись прочитайте правила📕rules\nТа деяку загальну інформацію📘info\nНажміть реакцію для верифікації',
					color: '#004B4B'
                }]})
            } else {
                begin_message = await messages.first().edit({embeds: [{
                    title: 'Верифікація',
                    description: 'Ласкаво просимо на сервері! \nВи новачок, тож не верифіковані і не можете повноцінно перебувати на сервері.\nЩоб верифікуватись прочитайте правила📕rules\nТа деяку загальну інформацію📘info\nНажміть реакцію для верифікації',
					color: '#004B4B'
                }]})
            }
            
        } else if(messages.size == 0){
            begin_message = await this.begin_channel.send({embeds: [{
				title: 'Верифікація',
				description: 'Ласкаво просимо на сервері! \nВи новачок, тож не верифіковані і не можете повноцінно перебувати на сервері.\nЩоб верифікуватись прочитайте правила📕rules\nТа деяку загальну інформацію📘info\nНажміть реакцію для верифікації',
				color: '#004B4B'
			}]})
        } else {
            let isSended = false;
            log(`В каналі для книги ${this.name} знайдено посторонні повідомлення. Видаляєм їх та створюємо своє...`, 'error')
            messages.forEach(async message => {
                if(message.author.id != this.user.id || isSended) {
                    await message.delete();
                } else if(message.author.id == this.user.id && !isSended) {
                    isSended = true
                    begin_message = message;
                };
            })

            begin_message.edit({embeds: [{
				title: 'Верифікація',
				description: 'Ласкаво просимо на сервері! \nВи новачок, тож не верифіковані і не можете повноцінно перебувати на сервері.\nЩоб верифікуватись прочитайте правила📕rules\nТа деяку загальну інформацію📘info\nНажміть реакцію для верифікації',
				color: '#004B4B'
			}]})
        }
        
        await begin_message.reactions.removeAll();
        await begin_message.react('✅');
	}

	async loadCommands () {
		this.commands = [];
		const path = this.config.commands_path;
		log('Команди завантажуються...');

		fs.readdirSync(`${path}`).forEach((file, index) => {
			if(file.endsWith('.js')) {
				const cname = file.substring(0, file.length-3);
				const command = require(`../${path}/${file.toString()}`);
				this.commands[cname] = command;
				this.commands[index] = command;

				log(`\tКоманду ${file.toLowerCase().substring(0, file.length-3)} завантажено`);
			}
		})
		log('Усі команди завантажено')
	}

	async loadEvents () {
		this.events = [];
		const path = this.config.events_path;
		log('Події завантажуються...');

		fs.readdirSync(`${path}`).forEach((file, index) => {
			if(file.endsWith('.js')) {
				const ename = file.substring(0, file.length-3);
				const event = require(`../${path}/${file.toString()}`);

				this.on(ename, event.run);
				this.events[index] = event;

				log(`\tПодію ${file.toLowerCase().substring(0, file.length-3)} завантажено`);
			}
		})
		log('Усі події завантажено')
	}

	async loadInfoBooks () {
		this.infoBooks = [];
		const channels = this.guild.channels.cache;
		const path = this.config.books_path;

		fs.readdirSync(`${path}/infoBooks`).forEach(folder => {
			new InfoBook({
				client: this,
				folder_path: `${path}/infoBooks/${folder.toString()}`
			})
		})
	}

	async dbConnection () {
		this.connection = await mysql.createConnection({
			host: process.env.DB_HOST != undefined ? process.env.DB_HOST : require('../secret.json').DB_HOST,
			user: process.env.DB_USERNAME != undefined ? process.env.DB_USERNAME : require('../secret.json').DB_USERNAME,
			password: process.env.DB_PASSWORD != undefined ? process.env.DB_PASSWORD : require('../secret.json').DB_PASSWORD,
			database: process.env.DB_DATABASE != undefined ? process.env.DB_DATABASE : require('../secret.json').DB_DATABASE
		})
		
		await this.connection.connect(async (err) => {
			if (err) {
				log(`Підключення неуспішне ${err}`, 'error')
			} else {
				log('Підключення успішне')
				await this.regMembers()
				setInterval (() => {
					this.connection.query('SELECT 1')
				}, 10000)
			}
		});
	}


	
	async regMembers () {
		await this.connection.query(`CREATE TABLE IF NOT EXISTS members ( 
			id BIGINT NOT NULL ,
			messages INT NOT NULL DEFAULT 0 ,
			experience INT NOT NULL DEFAULT 0 ,
			level INT NOT NULL DEFAULT 0 ,
			PRIMARY KEY (ID)
			)`
			)
		const members = await this.guild.members.fetch();
		members.forEach(member => {
			
			if(!member.user.bot) {
				this.connection.query(`SELECT * FROM members WHERE id = ${member.id}`, (error, rows, fields) => {
					if(rows[0]) return;
					this.connection.query(`INSERT INTO members (id) VALUES(${member.id})`, err => {
						if(err) {
							log('Трапилась помилка під час запису мембера до бази даних', 'error')
						}
					})
				})
			}
		})
	}
	
	

	login () {
		try {
			const tokenLocal = require('../secret.json').token;
			super.login(tokenLocal)
		} catch {
			super.login(process.env.token);
		}
	}
}

module.exports = Morgan;