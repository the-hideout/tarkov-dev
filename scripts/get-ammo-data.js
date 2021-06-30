const fs = require('fs');
const path = require('path');

const got = require('got');

const symbols = require('../src/symbols.json');

// const customAmmo = [
//     {
//         type: '7.62x39 mm',
//         name: 'MAI AP',
//         damage: 47,
//         penetration: 58,
//         fragChance: '0%',
//         symbol: {
//             fill: "rgb(71, 121, 152)",
//             type: "Plus"
//         },
//     },
//     {
//         type: '5.56x45 mm',
//         name: 'Mk 318 Mod 0 (SOST)',
//         damage: 65,
//         penetration: 21,
//         fragChance: '0%',
//         symbol: {
//             fill: 'green',
//             type: 'Diamond',
//         },
//     },
//     {
//         type: '5.56x45 mm',
//         name: 'SSA AP',
//         damage: 36,
//         penetration: 56,
//         fragChance: '0%',
//         symbol: {
//             fill: 'green',
//             type: 'Diamond',
//         },
//     },
// ];

const skipTypes = [
    'Caliber30x29',
    'Caliber40x46',
    'Caliber127x108',
];

const caliberMap = {
    'Caliber366TKM': '.366',
    'Caliber556x45NATO': '5.56x45 mm',
    'Caliber1143x23ACP': '.45',
    'Caliber127x55': '12.7x55 mm',
    'Caliber23x75': '23x75 mm',
    'Caliber46x30': '4.6x30 mm',
    'Caliber545x39': '5.45x39 mm',
    'Caliber57x28': '5.7x28 mm',
    'Caliber762x25TT': '7.62x25 mm',
    'Caliber762x35': '.300 Blackout',
    'Caliber762x39': '7.62x39 mm',
    'Caliber762x51': '7.62x51 mm',
    'Caliber762x54R': '7.62x54R',
    'Caliber86x70': '.338 Lapua Magnum',
    'Caliber9x18PM': '9x18 mm',
    'Caliber9x19PARA': '9x19 mm',
    'Caliber9x21': '9x21 mm',
    'Caliber9x39': '9x39 mm',
};

const URLS = [
    'https://raw.githack.com/TarkovTracker/tarkovdata/master/ammunition.json',
];

let tempType = false;
let typeCache = [];

const getPrettyCaliber = (item) => {
    if(item.type === 'Caliber12g' && item.damage > 70){
        return '12 Gauge Slug';
    }
    
    if (item.type === 'Caliber12g'){
        return '12 Gauge Shot';
    }

    if(item.type === 'Caliber20g'){
        return '20 Gauge';
    }

    return caliberMap[item.type] || item.type.replace('Caliber', '');
}

const formatRow = function formatRow(row){
    if(skipTypes.includes(row.caliber)){
        return false;
    }

    const formattedRow = {
        type: row.caliber,
        name: row.name,
        shortName: row.shortName,
        damage: Number(row.ballistics.damage),
        penetration: Number(row.ballistics.penetrationPower),
        armorDamage: Number(row.ballistics.armorDamage),
        fragChance: row.ballistics.fragChance,
        id: row.id.toString(),
    };

    formattedRow.type = getPrettyCaliber(formattedRow);

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

    return formattedRow;
};

const getAmmoData = async function getAmmoData(url){
    console.time(`Get data url ${url}`);
    try {
        const response = await got(url, {
            responseType: 'json',
            timeout: 5000,
        });
        console.timeEnd(`Get data url ${url}`);

        return response;
    } catch (responseError){
        console.timeEnd(`Get data url ${url}`);
        console.error(responseError);
    }

    return false;
};

(async () => {
    let response = false;
    for(let i = 0; i < URLS.length; i = i + 1){
        response = await getAmmoData(URLS[i]);

        if(response){
            break;
        }
    }

    const dataset = {
        updated: new Date(),
        data: Object.values(response.body).map((ammoObject) => {
            return formatRow(ammoObject);
        }).filter(Boolean),
    };

    if(typeof customAmmo !== 'undefined'){
        dataset.data = dataset.data.concat(customAmmo);
    }

    console.time('Write new data');
    fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'ammo.json'), JSON.stringify(dataset, null, 4));
    console.timeEnd('Write new data');
})()
