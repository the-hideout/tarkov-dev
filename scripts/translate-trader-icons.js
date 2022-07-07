const { readdirSync, readFileSync, copyFile } = require('fs');

const dir = 'src/translations';

// Loop through all folders in the src/translations directory
const items = readdirSync(dir);
console.log(items);

// Loop through each folder in the src/translations directory
for (const item of items) {
    let rawdata = readFileSync(`${dir}/${item}/translation.json`);
    let translationsParsed = JSON.parse(rawdata);
    const prapor = translationsParsed.Prapor.toLowerCase();
    const skier = translationsParsed.Skier.toLowerCase();
    const peacekeeper = translationsParsed.Peacekeeper.toLowerCase();
    const therapist = translationsParsed.Therapist.toLowerCase();
    const mechanic = translationsParsed.Mechanic.toLowerCase();
    const ragman = translationsParsed.Ragman.toLowerCase();
    const fence = translationsParsed.Fence.toLowerCase();

    copyFile('public/images/prapor-icon.jpg', `public/images/${prapor}-icon.jpg`, (err) => {
        if (err) 
            throw err;
        console.log(`prapor-icon.jpg was copied to ${prapor}-icon.jpg`);
    });

    copyFile('public/images/skier-icon.jpg', `public/images/${skier}-icon.jpg`, (err) => {
        if (err) 
            throw err;
        console.log(`skier-icon.jpg was copied to ${skier}-icon.jpg`);
    });

    copyFile('public/images/peacekeeper-icon.jpg', `public/images/${peacekeeper}-icon.jpg`, (err) => {
        if (err) 
            throw err;
        console.log(`peacekeeper-icon.jpg was copied to ${peacekeeper}-icon.jpg`);
    });

    copyFile('public/images/therapist-icon.jpg', `public/images/${therapist}-icon.jpg`, (err) => {
        if (err) 
            throw err;
        console.log(`therapist-icon.jpg was copied to ${therapist}-icon.jpg`);
    });

    copyFile('public/images/mechanic-icon.jpg', `public/images/${mechanic}-icon.jpg`, (err) => {
        if (err) 
            throw err;
        console.log(`mechanic-icon.jpg was copied to ${mechanic}-icon.jpg`);
    });

    copyFile('public/images/ragman-icon.jpg', `public/images/${ragman}-icon.jpg`, (err) => {
        if (err) 
            throw err;
        console.log(`ragman-icon.jpg was copied to ${ragman}-icon.jpg`);
    });

    copyFile('public/images/fence-icon.jpg', `public/images/${fence}-icon.jpg`, (err) => {
        if (err) 
            throw err;
        console.log(`fence-icon.jpg was copied to ${fence}-icon.jpg`);
    });
}
