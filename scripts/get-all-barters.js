const fs = require('fs');
const path = require('path');

const got = require('got');
const cheerio = require('cheerio');

let itemData = false;

const TRADES_URL = 'https://escapefromtarkov.gamepedia.com/Barter_trades';

const REPLACEMENTS = {
    'MRE': 'MRE lunch box',
    'Frameless': 'Red Rebel Ice pick',
    'Team Wendy EXFIL Ballistic Helmet': 'Team Wendy EXFIL Ballistic Helmet Black',
};

const fixNames = (name) => {
    return REPLACEMENTS[name] || name;
};


const getItemByName = (searchName) => {
    const itemArray = Object.values(itemData);
    let returnItem = itemArray.find((item) => {
        return item.name.toLowerCase().trim() === searchName.toLowerCase().trim();
    });

    if(returnItem){
        return returnItem;
    }

    returnItem = itemArray.find((item) => {
        return item.shortName.toLowerCase().trim() === searchName.toLowerCase().trim();
    });

    if(returnItem){
        return returnItem;
    }

    return itemArray.find((item) => {
        if(!item.name.includes('(')){
            return false;
        }

        const match = item.name.toLowerCase().match(/(.*)\s\(.+?$/);

        if(!match){
            return false;
        }

        return match[1].trim() === searchName.toLowerCase().trim();
    });
};

const getItemData = function getItemData(html){
    if(!html){
        return false;
    }

    const $ = cheerio.load(html);
    let count = 1;

    const numberMatch = $('body').remove('a,img').text().match(/\d+/gm);

    if(numberMatch){
        count = Number(numberMatch[0]);
    }

    let name = fixNames($('a').eq(0).prop('title'));

    if(!name){
        name = fixNames($('a').eq(-1).prop('title'));
    }

    const item = getItemByName(name);

    if(!item){
        console.log(`Found no item called ${name}`);

        return false;
    }

    // console.log(item);

    // process.exit(1);

    return {
        name: item.name,
        id: item.id,
        count: count,
    };
};

module.exports = async function() {
    const response = await got(TRADES_URL);
    const $ = cheerio.load(response.body);
    const trades = {
        updated: new Date(),
        data: [],
    };
    const traderIndex = [
        'Prapor',
        'Therapist',
        'Skier',
        'Peacekeeper',
        'Mechanic',
        'Ragman',
        'Jaeger',
    ];
    itemData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'all-en.json')));

    $('.wikitable').each((traderTableIndex, traderTableElement) => {
        $(traderTableElement)
            .find('tr')
            .each((tradeIndex, tradeElement) => {
                if(tradeIndex === 0){
                    return true;
                }

                const $trade = $(tradeElement);
                const rewardItem = getItemByName(fixNames($trade.find('th').eq(-1).find('a').eq(0).prop('title')));

                const tradeData = {
                    requiredItems: [],
                    rewardItems: [{
                        name: rewardItem.name,
                        id: rewardItem.id,
                        count: 1,
                    }],
                    trader: traderIndex[traderTableIndex],
                };

                let items = $trade.find('th').eq(0).html().split(/<br>\s?\+\s?<br>/);
                const itemCountMatches = $trade.find('th').eq(0).text().match(/\sx\d/gm) || ['x1'];

                if(itemCountMatches.length > items.length){
                    items = $trade.find('th').eq(0).html().split(/<br><br>/);
                }

                if(itemCountMatches.length > items.length){
                    items = $trade.find('th').eq(0).html().split(/\n.+?<\/a>/gm);
                }

                if(itemCountMatches.length > items.length){
                    // console.log($trade.find('th').eq(0).html());
                    // console.log(items.length, itemCountMatches);
                    // console.log();

                    return true;
                }

                tradeData.requiredItems = items.map(getItemData).filter(Boolean);

                // Failed to map at least one item
                if(tradeData.requiredItems.length !== items.length){
                    return true;
                }

                // Tactical sword is not in the game?
                if(tradeData.requiredItems.find((item) => {
                    return item.name.toLowerCase().includes('m-2 tactical sword');
                })) {
                    return true;
                }

                trades.data.push(tradeData);

                return true;
            });
    });

    fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'barters.json'), JSON.stringify(trades, null, 4));
};

module.exports();
