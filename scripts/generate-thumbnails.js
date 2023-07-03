const { default: fetch } = require('cross-fetch');
const fs = require('fs/promises');

const sharp = require('sharp');

(async () => {
    console.time('Generating thumbnails');
    
    // Max height from css ".map-wrapper img"
    const maxHeight = 200;
    const mapsPath = './public/maps/';
    const files = await fs.readdir(mapsPath);
    for (const fileName of files) {
        if (!fileName.endsWith('.jpg'))
            continue;
        if (fileName.endsWith('_thumb.jpg'))
            continue;
        const thumbName = fileName.replace('.jpg', '_thumb.jpg');
        console.log(`Generating ${thumbName}`);
        const image = sharp(mapsPath+fileName).resize(null, maxHeight).jpeg({mozjpeg: true, quality: 90});
        await image.toFile(mapsPath+thumbName);
    }
    const mapGroups = JSON.parse(await fs.readFile('./src/data/maps.json'));
    for (const group of mapGroups) {
        for (const map of group.maps) {
            if (map.projection !== 'interactive')
                continue;
            let path = map.mapPath || `https://assets.tarkov.dev/maps/${group.normalizedName}/{z}/{x}/{y}.png`;
            path = path.replace(/{[xyz]}/g, '0');
            const imageRequest = await fetch(path);
            const image = sharp(await imageRequest.arrayBuffer()).trim('#00000000').resize(null, maxHeight).jpeg({mozjpeg: true, quality: 90});
            const thumbName = `${group.normalizedName}_thumb.jpg`;
            console.log(`Generating ${thumbName}`);
            await image.toFile(mapsPath+thumbName);
        }
    }
    console.timeEnd('Generating thumbnails');
})();
