import fs from "fs";
import path from "path";

const files = [
    //'item-props',
    'item-grids',
    //'globals',
    //'item_presets',
];

for (const file of files) {
    const __dirname = new URL(".", import.meta.url).pathname;
    const props = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', `${file}.json`)));

    fs.writeFileSync(path.join(__dirname, '..', 'public', 'data', `${file}.min.json`), JSON.stringify(props));
}
