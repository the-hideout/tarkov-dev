import fs from "fs";
import path from "path";
import url from "url";

const files = [
    //'item-props',
    'item-grids',
    //'globals',
    //'item_presets',
];

for (const file of files) {
    const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
    const props = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', `${file}.json`)));

    fs.writeFileSync(path.join(__dirname, '..', 'public', 'data', `${file}.min.json`), JSON.stringify(props));
}
