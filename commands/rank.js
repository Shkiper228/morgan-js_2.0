const Command = require('../classes/Command.js');
const log = require('../classes/Logger.js');


const rank = new Command(client, {
    name: 'rank',
    description: 'Команда для допомоги з командами(яку ви щойно написали)',
    ownerOnly: false,
    adminOnly: false
}, async (client, message, args) => {
    client.connection.query(`SELECT * FROM members`, async (error, rows) => {
        
        /*const indexAuthor = rows.findIndex(row => {
            if(row.id == message.author.id){
                return true;
            }
        })*/


        let indexAuthor;

        const unsortedArr = [];
        const sortedArr = [];

        rows.forEach(row => {
            unsortedArr.push(row);
        })

        
        let indexMax;

        for(let i = 0; i < rows.length; i++) {
            for(let n = 0; n < unsortedArr.length; n++) {
                if(indexMax == undefined || rows[indexMax].experience < rows[n].experience) indexMax = n;
            }
         
            sortedArr.push(rows[indexMax])
            unsortedArr.splice(indexMax, 1);
            log(rows[indexMax].experience);

            if(rows[indexMax] == message.author.id) indexAuthor = sortedArr.length - 1;
            
            indexMax = undefined;
         }
        /*
        console.log('Масив до сортування:');
        console.log(f);
        
        
        for(let i = 0; i < 10; i++) {
           for(let n = 0; n < 10; n++) {
        
                if(f[n] == -1) {
                   continue;
                }
        
                if(f[minIndex] != -1 && minIndex== undefined) {
                    minIndex = n
                }
                if(f[minIndex] > f[n]) {
                    minIndex = n
                }    
           }
        
           r.push(f[minIndex])
        
           f[minIndex] = -1
        
           minIndex = undefined;
        }
        
        console.log('Після');
        console.log(r);*/
        rows.forEach((row, index) => {
            if(max == undefined || max < row.experience)
        });
    })
    const member = await client.guild.members.fetch(message.author.id);
    client.connection.query(`SELECT * FROM members WHERE id = ${message.author.id}`, async (error, rows) => {
        message.channel.send({
            embeds: [{
                title: `Ранг \`${message.author.tag}\``,
                description: `\t\t**Досвід:** \`${rows[0].experience}\`\n\t\t**Рівень:** \`${rows[0].level}\``,
                color: '#2D7144'
            }]
        })
    })
})

module.exports = rank;