const fs = require('fs');
const path = require('path');

const got = require('got');

const URLS = [
    'https://api.sheetson.com/v1/sheets/0.12%20Patch?spreadsheetId=1l_8zSZg-viVTZ2bavMEIIKhix6mFTXuVHWcNKZgBrjQ&limit=100',
    'https://api.sheetson.com/v1/sheets/0.12%20Patch?spreadsheetId=1l_8zSZg-viVTZ2bavMEIIKhix6mFTXuVHWcNKZgBrjQ&limit=100&skip=100',
];

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
    
    console.time('Write new data');
    fs.writeFileSync(path.join(__dirname, '..', 'src', 'data.json'), JSON.stringify(dataset, null, 4));
    console.timeEnd('Write new data');
})()
