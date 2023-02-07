const { Client, Intents } = require('discord.js');
const mysql = require('mysql2');
const fs = require('fs');
const { groundChannel, createOrFindMessage } = require('../utils/channelsUtils.js');
const InfoBook = require('../classes/books/InfoBook.js');
const CommandBook = require('../classes/books/CommandBook.js')
const log = require('../classes/Logger.js');
const Timer = require('../classes/Timer.js');
const { Player } = require('discord-player');

class Morgan extends Client {
    constructor () {
        super({
            intents: [
				Intents.FLAGS.GUILDS,
				Intents.FLAGS.GUILD_MEMBERS,
				Intents.FLAGS.GUILD_MESSAGES,
				Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
				Intents.FLAGS.GUILD_VOICE_STATES,
				Intents.FLAGS.DIRECT_MESSAGES,
				Intents.FLAGS.GUILD_SCHEDULED_EVENTS
			],
			allowedMentions: {
				parse: ["users"]
            }
        })

        this.config = require('../config.json').general;
		
		this.InfoBook = [];
		this.privat_voices = [];
		
    }

	async init() {
		this.guild = await this.guilds.fetch(this.config.guild);
		log(`Кількість емодзі: ${this.guild.emojis.cache.size}`)
		this.owner = await this.guild.members.fetch(this.config.owner);
		
		this.player = new Player(this);
		this.player.on('trackStart', async (queue, track) => {
			if(this.player.getQueue(this.guild).repeatMode != 1) {
				await queue.metadata.channel.send({embeds: [{
					title: `**${track.author}**`,
					description: `${track.title}\n\`Тривалість:\n${track.duration}\``,
					image: {
						url: track.thumbnail,
						height: 128,
						width: 128
					}
				}]});
			}
		})

		this.player.on('connectionError', (queue, error) => {
			log(`Сталась помилка --> ${error}`)
		})

		this.player.on('error', (queue, error) => {
			log(`Сталась помилка --> ${error}`)
		})
		
		
		await this.initPrimaryChannels();
		await this.loadCommands();
		await this.loadEvents();
		await this.loadInfoBooks();
		await this.dbConnection();
		await this.regTimers();
		await this.regChannels();
	}

	async initPrimaryChannels() {
		//welcome
		this.begin_channel = await groundChannel(this, '✅welcome');
		await this.begin_channel.permissionOverwrites.create(this.guild.roles.everyone, {
			'VIEW_CHANNEL': true,
			'SEND_MESSAGES': false,
			'ADD_REACTIONS': false
		})
		const begin_message = await createOrFindMessage(this, this.begin_channel, {embeds: [{
			title: 'Верифікація',
			description: 'Ласкаво просимо на сервері! \nВи новачок, тож не верифіковані і не можете повноцінно перебувати на сервері.\nЩоб верифікуватись прочитайте правила <#704384154925662280>\nТа деяку загальну інформацію <#842853700237656135>\nНажміть реакцію для верифікації',
			color: '#004B4B'
		}]})

		const begin_book = new CommandBook(this, this.begin_channel, begin_message, 'Верифікація', 'Ласкаво просимо на сервері! \nВи новачок, тож не верифіковані і не можете повноцінно перебувати на сервері.\nЩоб верифікуватись прочитайте правила <#704384154925662280>\nТа деяку загальну інформацію <#842853700237656135>\nНажміть реакцію для верифікації', '#004B4B')
		begin_book.functions.push(async (user) => {
			const member = await begin_book.message.guild.members.fetch(user.id);
        	const roles = member.roles;
        	await roles.add('704691487857704980', 'Верифікувався'); //замінити
		})

		begin_book.emojis = ['✅'];
		begin_book.start();
		//await begin_message.reactions.removeAll();
		//await begin_message.react('✅');
		
		//users channel
		this.users_channel = await groundChannel(this, '📗users');
		await this.users_channel.permissionOverwrites.create(this.guild.roles.everyone, {
			'VIEW_CHANNEL': true,
			'SEND_MESSAGES': false,
			'ADD_REACTIONS': false
		})

		//creatende privat voice
		this.creatende_privat_voice = await groundChannel(this, '[+] Створити приватний канал', {type: 'GUILD_VOICE'})
	}

	async loadCommands () {
		this.commands = [];
		const path = this.config.commands_path;
		log('Команди завантажуються...');

		fs.readdirSync(`${path}`).forEach((file, index) => {
			if(file.endsWith('.js')) {
				try {
					const cname = file.substring(0, file.length-3).toLowerCase();
					const command = require(`../${path}/${file.toString()}`);
					this.commands[cname] = command;
					this.commands[index] = command;

					log(`\tКоманду ${file.toLowerCase().substring(0, file.length-3)} завантажено`);
				} catch (error) {
					log(`\tКоманду ${file.toLowerCase().substring(0, file.length-3)} не вийшло завантажити із помилкою: ${error}`, 'error')
				}
				
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
			const book = new InfoBook({
				client: this,
				folder_path: `${path}/infoBooks/${folder.toString()}`,
				channel: this.map_channel,
			})

			book.start();
		})
	}

	async dbConnection () {

		this.connection = await mysql.createConnection({
			host: process.env.DB_HOST != undefined ? process.env.DB_HOST : require('../secret.json').DB_HOST,
			port: process.env.DB_PORT != undefined ? process.env.DB_PORT : require('../secret.json').DB_PORT,
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
		this.connection.query(`CREATE TABLE IF NOT EXISTS members ( 
			id BIGINT NOT NULL ,
			messages INT NOT NULL DEFAULT 0 ,
			experience INT NOT NULL DEFAULT 0 ,
			level INT NOT NULL DEFAULT 0 ,
			money INT NOT NULL DEFAULT 0,
			PRIMARY KEY (ID)
			)`
			)
		const members = await this.guild.members.fetch();
		members.forEach(member => {
			if(!member.user.bot) {
				this.connection.query(`SELECT * FROM members WHERE id = ${member.id}`, (error, rows) => {
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
	
	async regTimers () {
		function getTimeOfDaysMonthYears(days, currentM, month, currentY, year) {
			let time = days * 24 * 60 * 60;
			const x = [
				() => {return 31},
				() => {return currentY % 4 == 0 ? 29 : 28},
				() => {return 31},
				() => {return 30},
				() => {return 31},
				() => {return 30},
				() => {return 31},
				() => {return 31},
				() => {return 30},
				() => {return 31},
				() => {return 30},
				() => {return 31}
			]
			
			let y = month > 0 ? 1 : -1;
			let m = 0;
			//month = Math.abs(month);
			for (; month != 0; month -= y) {
				if (currentM + 1 > 12) {
					currentM = 0;
					currentY++;
					year--;
				}
				time += x[currentM]() * 24 * 60 * 60 * y;
				m++;
				currentM++;
			}

			y = year > 0 ? 1 : -1;
			let ye = 0;
			for(; year != 0; year -= y) {
				time += (currentY % 4 == 0 ? 366 : 365) * 24 * 60 * 60 * y;
				ye++;
				currentY += y;
			}
			return time;
		}

		this.connection.query(`CREATE TABLE IF NOT EXISTS timers ( 
			id INT NOT NULL AUTO_INCREMENT ,
			date_time VARCHAR(19) NOT NULL ,
            channel VARCHAR(20) NOT NULL ,
            title VARCHAR(255),
            description VARCHAR(255) ,
            sender VARCHAR(23) ,
            color VARCHAR(6) ,
			PRIMARY KEY (id)
			)`
		)

		this.connection.query('SELECT * FROM timers', (error, rows) => {
			if(error) return;
			
			rows.forEach((timer) => {
				
				const current = new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kiev' });
				const 	currentDate = current.split(', ')[0],
						currentTime = current.split(', ')[1]
				
				const 	currentYear = currentDate.split('.')[2],
						currentMonth = currentDate.split('.')[1],
						currentDay = currentDate.split('.')[0],
						currentHour = currentTime.split(':')[0],
						currentMinute = currentTime.split(':')[1],
						currentSecond = currentTime.split(':')[2]
				
				
				const date_time = `${timer.date_time}`;
				const 	timerDate = date_time.split(' ')[0],
						timerTime = date_time.split(' ')[1]

				const 	timerYear = timerDate.split('.')[0],
						timerMonth = timerDate.split('.')[1],
						timerDay = timerDate.split('.')[2],
						timerHour = timerTime.split(':')[0],
						timerMinute = timerTime.split(':')[1],
						timerSecond = timerTime.split(':')[2]

				
				const second = timerSecond - currentSecond;
				const minute = timerMinute - currentMinute;
				const hour = timerHour - currentHour;
				
				const day = timerDay - currentDay;
				const month = timerMonth - currentMonth;
				const year = timerYear - currentYear;
				
				
				//log(`Seconds: ${second}\n Minutes: ${minute}\nHours: ${hour}\nMonth: ${month}\nYears: ${year}`, 'warning')
				const time = second + minute * 60 + hour * 60 * 60 + getTimeOfDaysMonthYears(day, Number(currentMonth), month, Number(currentYear), year);



				log(`Через ${time} спрацює таймер\nУ днях це ${time / 60 / 60 / 24}\nУ годинах ${time / 60 / 60}\nУ хвилинах ${time / 60}`);
				new Timer(this, time, timer.channel, timer.title, timer.description, timer.sender, timer.color, timer.id, true);
			})
		})
	}

	async regChannels () {
		this.connection.query(`CREATE TABLE IF NOT EXISTS privat_channels ( 
			id VARCHAR(20) NOT NULL ,
			owner VARCHAR(23),
			PRIMARY KEY (ID)
			)`
		)

		this.connection.query('SELECT * FROM privat_channels', (err, rows) => {
			if(rows && rows[0]) {
				console.log(rows);
				rows.forEach(async (channel) => {
					try {
						const voice = await this.guild.channels.fetch(channel.id)
						if(voice.members.size != 0) {
							this.privat_voices.push({channel: voice, owner: channel.owner});
						} else {
							this.connection.query(`DELETE FROM privat_channels WHERE id = ${channel.id}`)
							voice.delete();
						}
					} catch {
						this.connection.query(`DELETE FROM privat_channels WHERE id = ${channel.id}`)
					}
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