const fs = require('fs');
const path = require('path');

const got = require('got');
const cheerio = require('cheerio');

const approvedItemName = (itemName) => {    
    if(itemName.length <= 0){
        return false;
    }
    
    return true;
};

(async() => {
    const pageData = await got('https://escapefromtarkov.gamepedia.com/Keys_%26_Intel');
    const $ = cheerio.load(pageData.body);
    const keys = [];
    
    $('.tabber .wikitable.sortable tbody').each((index, element) => {
        $(element).find('tr').each((rowIndex, rowElement) => {                      
            const itemName = $(rowElement).find('td').eq(0).text().trim();
            
            if(!approvedItemName(itemName)){
                return true;
            }
            
            keys.push({
                name: itemName,
            });
        });
    });
    
    console.log(`found ${keys.length} keys`);
    fs.writeFileSync(path.join(__dirname, '..', 'data', 'keys.json'), JSON.stringify(keys, null, 4));
})();
