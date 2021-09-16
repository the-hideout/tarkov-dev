const fs = require('fs');
const path = require('path');

const got = require('got');

const symbols = require('../src/symbols.json');
const formatCaliber = require('../src/modules/format-ammo');

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

const URLS = [
    'https://raw.githack.com/TarkovTracker/tarkovdata/master/ammunition.json',
];

let typeCache = [];

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

    if(formattedRow.type === 'Caliber12g' && formattedRow.damage > 70){
        formattedRow.type = '12 Gauge Slug';
    } else {
        formattedRow.type = formatCaliber(formattedRow.type);
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
