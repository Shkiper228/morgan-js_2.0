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
                if(indexMax == undefined || unsortedArr[indexMax].experience < unsortedArr[n].experience) indexMax = n;
            }
         
            sortedArr.push(unsortedArr[indexMax])
            log(`${unsortedArr[indexMax].experience} ${unsortedArr[indexMax].id}`);
            
            

            if(unsortedArr[indexMax].experience == message.author.id) indexAuthor = sortedArr.length - 1;

            unsortedArr.splice(indexMax, 1);
            indexMax = undefined;
         }
         


        await message.channel.send({
            embeds: [{
                title: `Ранг \`${message.author.tag}\``,
                description: `\t\t**Досвід:** \`${sortedArr[indexAuthor].experience}\`\n\t\t**Рівень:** \`${sortedArr[indexAuthor].level}\`\n\t\t**Рейтинг:** \`${indexAuthor}\``,
                color: '#2D7144'
            }]
        })
    })
})

module.exports = rank;