const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const fetch = require('cross-fetch');

const categoryPages = require('../src/data/category-pages.json');
const { exit } = require('process');


const graphqlRequest = (queryString) => {
    return fetch('https://api.tarkov.dev/graphql', {
        method: 'POST',
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify({
            query: queryString
        }),
    }).then(response => response.json());
};

function shuffle(array) {
    let currentIndex = array.length;
    let randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex > 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
}

(async () => {
    try {
        console.time('Generating thumbnails');

        const maxWidth = 256;
        const maxHeight = 144;
        const mapsPath = './public/images/items/';

        for (const categoryPage of categoryPages) {
            const originalImg = await sharp(mapsPath + categoryPage.key + '-table.png')
            const metadata = await originalImg.metadata()
            const scale = metadata.width / maxWidth
            const cropHeight = Math.ceil(scale * maxHeight)
            const itemWidth = metadata.width / 2
            const itemHeight = cropHeight / 2

            const croppedImage = originalImg.extract({ left: 0, top: 0, width: metadata.width, height: cropHeight })

        	let type = categoryPage.type;
        	if (type === 'gun') {
        		type = 'preset'
        	}
            const query = `{
                items(type: ${type}, limit:69) {
                    image512pxLink
                }
            }`;
        	const itemsOfType = await graphqlRequest(query);
            
            const items = itemsOfType.data.items
        	shuffle(items);

            const itemResize = {width: itemWidth, height: itemHeight, fit: sharp.fit.contain, background: { r: 255, g: 255, b: 255, alpha: 0.0 }}

            const tlImageFetch = await fetch(items[0].image512pxLink);
            const tlImageBuffer = await tlImageFetch.arrayBuffer();
            const tlImage = await sharp(tlImageBuffer).resize(itemResize).toBuffer()

            const trImageFetch = await fetch(items[1].image512pxLink);
            const trImageBuffer = await trImageFetch.buffer();
            const trImage = await sharp(trImageBuffer).resize(itemResize).toBuffer()

            const blImageFetch = await fetch(items[2].image512pxLink);
            const blImageBuffer = await blImageFetch.buffer();
            const blImage = await sharp(blImageBuffer).resize(itemResize).toBuffer()

            const brImageFetch = await fetch(items[3].image512pxLink);
            const brImageBuffer = await brImageFetch.arrayBuffer();
            const brImage = await sharp(brImageBuffer).resize(itemResize).toBuffer()

            const cImageFetch = await fetch(items[4].image512pxLink);
            const cImageBuffer = await cImageFetch.arrayBuffer();
            const cImage = await sharp(cImageBuffer).resize(itemResize).toBuffer()

            const composedImage = await croppedImage
                .blur(6)
                .composite([
                    { input: tlImage, gravity: 'northwest', blend: 'over' },
                    { input: trImage, gravity: 'northeast', blend: 'over' },
                    { input: blImage, gravity: 'southwest', blend: 'over' },
                    { input: brImage, gravity: 'southeast', blend: 'over' },
                    { input: cImage, gravity: 'centre', blend: 'over' },
                ]).toBuffer()
            
            const finalImage = await sharp(composedImage).resize(maxWidth, maxHeight).jpeg({mozjpeg: true, quality: 100});
            // const finalImage = await sharp(composedImage).jpeg({mozjpeg: true, quality: 90});
            
            await finalImage.toFile(mapsPath + categoryPage.key + '-table_thumb.jpg');

            console.log(`Generated thumbnail for ${categoryPage.key}`)
            // return
        };
        console.timeEnd('Generating thumbnails');
    } catch (error) {
        console.error(error)
        console.log('error generating thumbnail (offline mode?)')
    }
})();
