const fs = require('fs/promises');

const sharp = require('sharp');

(async () => {
    console.time('Generating thumbnails');
    
    // Max height from css ".map-wrapper img"
    const maxHeight = 200;
    const mapsPath = './public/maps/';
    const files = await fs.readdir(mapsPath);
    for (const fileName of files) {
        if (!fileName.endsWith('.jpg')) continue;
        if (fileName.endsWith('_thumb.jpg')) continue;
        const thumbName = fileName.replace('.jpg', '_thumb.jpg');
        console.log(`Generating ${thumbName}`);
        const image = sharp(mapsPath+fileName).resize(null, maxHeight).jpeg({quality: 80});
        await image.toFile(mapsPath+thumbName);
    }
    console.timeEnd('Generating thumbnails');
})();
