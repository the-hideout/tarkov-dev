import fetch from "cross-fetch";
import fs from "fs/promises";
import sharp from "sharp";

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
        const image = sharp(mapsPath + fileName).resize(null, maxHeight).jpeg({ mozjpeg: true, quality: 90 });
        await image.toFile(mapsPath + thumbName);
    }
    /*const mapGroups = JSON.parse(await fs.readFile('./src/data/maps.json'));
    for (const group of mapGroups) {
        for (const map of group.maps) {
            if (map.projection !== 'interactive')
                continue;
            let path = map.tilePath || map.svgPath || `https://assets.tarkov.dev/maps/${group.normalizedName}/{z}/{x}/{y}.png`;
            path = path.replace(/{[xyz]}/g, '0');
            const thumbName = `${group.normalizedName}_thumb.jpg`;
            try {
                const imageRequest = await fetch(path);
                console.log(`Generating ${thumbName}`);
                const image = sharp(await imageRequest.arrayBuffer()).trim('#00000000').resize(null, maxHeight).jpeg({mozjpeg: true, quality: 90});
                await image.toFile(mapsPath+thumbName);
                if (map.altMaps) {
                    for (const altKey of map.altMaps) {
                        await image.toFile(mapsPath+`${altKey}_thumb.jpg`);
                    }
                }
            } catch (error) {
                console.error(error)
                console.log(`Asset for ${thumbName} unavailable`)
            }
        }
    }*/
    console.timeEnd('Generating thumbnails');
})();
