const fs = require('fs');
const path = require('path');

const currentData = require('../assets/additional-patreon-data.json');

const csvData = fs.readFileSync(path.join(__dirname, '..', 'members.csv'), 'utf8');
const lines = csvData.split('\r\n');

let patrons = [];

const tiers = [
    'Basic',
    'Advanced',
    'Expert',
    'api-users',
];

const pledeToTier = (pledge) => {
    if(pledge >= 25){
        return 'Expert';
    }

    if(pledge >= 5){
        return 'Advanced';
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

let outputData = patrons.map(patron => {
    return {
        name: patron.Name.trim(),
        uid: patron['User ID'],
        tier: patron.Tier || pledeToTier(patron['Pledge Amount']),
        ...currentData.find(data => data.uid === patron['User ID']),
    };
});

outputData = outputData.concat(currentData.filter(patron => !patron.uid));

outputData = outputData.sort((a, b) => {
    if(a.tier === b.tier){
        return 0;
    }

    if(tiers.indexOf(a.tier) > tiers.indexOf(b.tier)) {
        return -1;
    }

    return 1;
});

fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'patreons.json'), JSON.stringify(outputData, null, 4));
