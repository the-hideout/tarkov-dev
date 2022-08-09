const fs = require('fs/promises');

const Jimp = require('jimp-compact');

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
        const image = (await Jimp.read(mapsPath+fileName)).resize(Jimp.AUTO, maxHeight).quality(70);
        image.write(mapsPath+thumbName);
    }
    console.timeEnd('Generating thumbnails');
})();
