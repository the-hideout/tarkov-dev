const fs = require('fs');
const path = require('path');

const got = require('got');

const symbols = require('../src/symbols.json');

const START_ROW = 32;
const END_ROW = 160;

const prefixes = [
    '9x18pm_',
    '762x25tt_',
    '9x19_',
    '9x21_',
    '57x28_',
    '46x30_',
    '9x39_',
    '366_',
    '545x39_',
    '556x45_',
    '762x39_',
    '762x51_',
    '762_54R_',
    '127x55_',
];

const URLS = [
    'https://sheet.best/api/sheets/3a724af7-406b-4648-8777-42dc7eb2c8c0',
];

let tempType = false;
let typeCache = [];

const formatRow = function formatRow(row){
    const formattedRow = {
        type: row['Streaming is what gives me the free time to work on this, come by sometime                  '] || tempType,
        name: row['1'],
        damage: Number(row['3']),
        penetration: Number(row['4']),
        armorDamage: Number(row['5']),
        fragChance: row['https://www.twitch.tv/nofoodaftermidnight'],
    };
    
    if(formattedRow.type === 'Mounted Weapons') {
        return false;
    }
    
    if(formattedRow.damage === 0) {
        return false;
    }
    
    let symbol = symbols[typeCache.length];
    
    if(typeCache.includes(formattedRow.type)) {
        symbol = symbols[typeCache.indexOf(formattedRow.type)];
    } else {
        typeCache.push(formattedRow.type);
    }
    
    if(!symbol) {
        console.log(`Missing symbol for ${formattedRow.type}`);
    }
    
    formattedRow.symbol = symbol;
    
    for(const prefix of prefixes){
        formattedRow.name = formattedRow.name.replace(prefix, '');
    }
    
    formattedRow.name = formattedRow.name.replace(/_/g, ' ');
    
    tempType = formattedRow.type;
    
    return formattedRow;
};

(async () => {
    let dataset = [];
    let rawData = [];
    
    console.time('Get excel sheet data');
    
    for(const url of URLS){
        const response = await got(url, {
            responseType: 'json',
        });
        
        rawData = rawData.concat(response.body);
    }
    console.timeEnd('Get excel sheet data');
    // let rawData = fs.readFileSync( path.join(__dirname, '..', 'src', 'raw-data2.json' ) );
    // rawData = JSON.parse(rawData);
    
    rawData = rawData.slice(START_ROW, END_ROW);
    dataset = rawData.map(formatRow).filter(Boolean);
    
    console.time('Write new data');
    fs.writeFileSync(path.join(__dirname, '..', 'src', 'data.json'), JSON.stringify(dataset, null, 4));
    console.timeEnd('Write new data');
})()
