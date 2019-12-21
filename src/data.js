import rawData from './data.json';
import symbols from './symbols';

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
let typeCache = [];
const parsedData = rawData.map((ammoRow) => {
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
        'Penetration Value': Number(ammoRow['Penetration Value']),
        'Damage': Number(ammoRow['Damage']),
        name: name,
        type: type,
        symbol: symbol,
    };
    
    return returnData;
}).filter(Boolean);

export default parsedData;
