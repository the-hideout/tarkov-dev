const fs = require('fs');
const path = require('path');

const currentData = require('../assets/additional-patreon-data.json');

const csvData = fs.readFileSync(path.join(__dirname, '..', 'members.csv'), 'utf8');
const lines = csvData.split('\r\n');

let patrons = [];

const pledeToTier = (pledge) => {
    if(pledge >= 25){
        return 'God among supporters';
    }

    if(pledge >= 5){
        return 'Basic+';
    }

    return 'Basic';
};

let firstLine = true;
let keys = false;
for(const line of lines){
    if(firstLine){
        keys = line.split(',');
        firstLine = false;

        continue;
    }

    const entryList = line.split(',').map((value, index) => {
        return [keys[index], value];
    });

    patrons.push(Object.fromEntries(entryList));
}

patrons = patrons.slice(0,  -1);

const outputData = patrons.map(patron => {

    return {
        ...currentData.find(data => data.uid === patron['User ID']),
        name: patron.Name.trim(),
        uid: patron['User ID'],
        tier: patron.Tier || pledeToTier(patron['Pledge Amount']),
    };
});

fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'patreons.json'), JSON.stringify(outputData, null, 4));
