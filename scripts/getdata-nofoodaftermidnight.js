const fs = require('fs');
const path = require('path');

const got = require('got');

const symbols = require('../src/symbols.json');

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
    'https://sheet.best/api/sheets/908aeaf1-75da-4488-ab19-ebed56f337a1', // Backup 2
    'https://sheet.best/api/sheets/d3cf595e-0d31-4fd8-891b-c0102afed308', // Original
    'https://sheet.best/api/sheets/cb15e425-1904-4306-a92d-6ea52747ee17', // Backup 1
];

let tempType = false;
let typeCache = [];

const formatRow = function formatRow(row){
    const formattedRow = {
        type: row['I stream:                 '] || tempType,
        name: row['1'],
        damage: Number(row['3']),
        penetration: Number(row['4']),
        armorDamage: Number(row['5']),
        fragChance: row['https://www.twitch.tv/nofoodaftermidnight'],
    };

    if(formattedRow.type === 'Mounted Weapons') {
        tempType = formattedRow.type;

        return false;
    }

    if(formattedRow.name.toLowerCase().includes('flashbang')){
        tempType = formattedRow.type;

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
        console.log(`Missing symbol for ${formattedRow.type}, the graph will crash. Add more symbols to src/symbols.json`);
        process.exit(1);
    }

    formattedRow.symbol = symbol;

    for(const prefix of prefixes){
        formattedRow.name = formattedRow.name.replace(prefix, '');
    }

    formattedRow.name = formattedRow.name.replace(/_/g, ' ');

    tempType = formattedRow.type;

    return formattedRow;
};

const getSheetData = async function getSheetData(url){
    console.time(`Get excel sheet data url ${url}`);
    try {
        const response = await got(url, {
            responseType: 'json',
            timeout: 5000,
        });
        console.timeEnd(`Get excel sheet data url ${url}`);

        return response;
    } catch (responseError){
        console.timeEnd(`Get excel sheet data url ${url}`);
        console.error(responseError);
    }

    return false;
};

(async () => {
    let response = false;
    for(let i = 0; i < URLS.length; i = i + 1){
        response = await getSheetData(URLS[i]);

        if(response){
            break;
        }
    }

    let started = false;
    let stopped = false;

    const dataset = {
        updated: new Date(),
        data: response.body.map((maybeAmmoType) => {
            if(maybeAmmoType['1'] === 'Ammo Type'){
                started = true;

                return false;
            }

            if(!started){
                return false;
            }

            if(maybeAmmoType['1'] === null){
                stopped = true;
            }

            if(stopped){
                return false;
            }

            return formatRow(maybeAmmoType);
        }).filter(Boolean),
    };

    console.time('Write new data');
    fs.writeFileSync(path.join(__dirname, '..', 'src', 'data.json'), JSON.stringify(dataset, null, 4));
    console.timeEnd('Write new data');
})()
