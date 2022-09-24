const Command = require('../classes/Command.js');
const log = require('../classes/Logger.js');
const { stringAndNumsFormat, checkAndConvertOfType } = require('../utils/stringAndNumsFormat.js');
const getColorByTime = require('../utils/colorByTime.js');


const timers = new Command(client, {
    name: 'timers',
    description: 'Відображення списку таймерів',
    ownerOnly: true,
    adminOnly: true
}, async (client, message, args) => {
	function getTimeOfDaysMonthYears(days, currentM, month, currentY, year) {
        let time = days * 24 * 60 * 60;
        log(`Days: ${days}`, 'warning')
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
        log(`Month: ${m}`, 'warning')

        y = year > 0 ? 1 : -1;
        let ye = 0;
        for(; year != 0; year -= y) {
            time += (currentY % 4 == 0 ? 366 : 365) * 24 * 60 * 60 * y;
            ye++;
            currentY += y;
        }
        log(`Years: ${ye}`, 'warning')
        return time;
    }



    client.connection.query('SELECT * FROM timers', (error, rows) => {
        if(error) return;
        const fieldsArr = [];
        const timersArray = [];
        
        rows.forEach((timer) => {
            timersArray.push({})
            
            const current = new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kiev' });
            const 	currentDate = current.split(', ')[0],
                    currentTime = current.split(', ')[1]
            log(`Date: ${currentDate}\nTime: ${currentTime}`)
            
            const 	currentYear = currentDate.split('.')[2],
                    currentMonth = currentDate.split('.')[1],
                    currentDay = currentDate.split('.')[0],
                    currentHour = currentTime.split(':')[0],
                    currentMinute = currentTime.split(':')[1],
                    currentSecond = currentTime.split(':')[2]
            
            
            const date_time = `${timer.date_time}`;
            const 	timerDate = date_time.split(' ')[0],
                    timerTime = date_time.split(' ')[1]
            log(`Date: ${timerDate}\nTime: ${timerTime}`);
            timersArray[timersArray.length - 1].timer_date_time = `${timerDate}   ${timerTime}`;

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
            
            
            log(`Seconds: ${second}\n Minutes: ${minute}\nHours: ${hour}\nMonth: ${month}\nYears: ${year}`, 'warning')
            const time = second + minute * 60 + hour * 60 * 60 + getTimeOfDaysMonthYears(day, Number(currentMonth), month, Number(currentYear), year);
            timersArray[timersArray.length - 1].timeLeft = `Час що залишився у днях: \`${Math.round(time / 60 / 60 / 24 * 100) / 100}\`, годинах: \`${Math.round(time / 60 / 60 * 100) / 100}\`, або хвилинах: \`${Math.round(time / 60 * 100) / 100}\``;
            fieldsArr.push({
                name: `_/\`${timersArray.length}\`\\_`,
                value: `Завершується: ${timersArray[timersArray.length - 1].timer_date_time}\n${timersArray[timersArray.length - 1].timeLeft}\nОтримувач: ${timer.sender}`
            })


            log(`Через ${time} спрацює таймер\nУ днях це ${time / 60 / 60 / 24}\nУ годинах ${time / 60 / 60}\nУ хвилинах ${time / 60}`);
            
        })

        if(fieldsArr.length > 0) {
            message.channel.send({embeds: [{
                title: 'Таймери',
                fields: fieldsArr,
                color: getColorByTime()
            }]})
        } else {
            message.channel.send({embeds: [{
                description: 'Поки немає зареєстрованих таймерів',
                color: getColorByTime()
            }]})
        }
        
    })
})

module.exports = timers;