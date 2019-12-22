const fs = require('fs');
const path = require('path');

const got = require('got');

const symbols = require('../src/symbols.json');

const URLS = [
    'https://api.sheetson.com/v1/sheets/0.12%20Patch?spreadsheetId=1l_8zSZg-viVTZ2bavMEIIKhix6mFTXuVHWcNKZgBrjQ&limit=100',
    'https://api.sheetson.com/v1/sheets/0.12%20Patch?spreadsheetId=1l_8zSZg-viVTZ2bavMEIIKhix6mFTXuVHWcNKZgBrjQ&limit=100&skip=100',
];

let typeCache = [];

function getTypeAndName(name) {
    
    if(name.includes('.366')) {
        return {
            type: '0.366',
            name: name.replace( '.366 ', '' ),
        };
    }
    
    if(name.includes('12/70')) {
        return {
            type: '12/70',
            name: name.replace( '12/70 ', '' ),
        };
    }
    
    if(name.includes('20/70')) {
        return {
            type: '20/70',
            name: name.replace( '20/70 ', '' ),
        };
    }
    
    const matches = name.match( /\d{1,2}(\.\d{1,2})?x\d*(\s?mm)?R?/ );
    
    return {
        type: matches[ 0 ].replace( /(\d)mm/g, '$1 mm'),
        name: name.replace( `${matches[ 0 ]}`, '' ).trim(),
    };
}

const formatRow = function formatRow(ammoRow){
    if(!ammoRow.Damage){
        return false;
    }
    
    if(ammoRow['0.12 Patch'].includes('12.7x108 mm')){
        return false;
    }
    
    const {type, name} = getTypeAndName(ammoRow['0.12 Patch']);
    
    let symbol = symbols[typeCache.length];
    
    if(typeCache.includes(type)) {
        symbol = symbols[typeCache.indexOf(type)];
    } else {
        typeCache.push(type);
    }
    
    if(!symbol) {
        console.log(`Missing symbol for ${type}`);
    }
    
    const returnData = {
        ...ammoRow,
        'penetration': Number(ammoRow['Penetration Value']),
        'damage': Number(ammoRow['Damage']),
        name: name,
        type: type,
        symbol: symbol,
    };
    
    return returnData;
}

(async () => {
    let dataset = [];
    
    console.time('Get excel sheet data');
    
    for(const url of URLS){
        const response = await got(url, {
            responseType: 'json',
        });
        
        dataset = dataset.concat(response.body.results);
    }
    console.timeEnd('Get excel sheet data');
    
    dataset = dataset.map(formatRow).filter(Boolean);
    
    console.time('Write new data');
    fs.writeFileSync(path.join(__dirname, '..', 'src', 'data.json'), JSON.stringify(dataset, null, 4));
    console.timeEnd('Write new data');
})()
