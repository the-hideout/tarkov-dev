const fs = require('fs');
const path = require('path');

const props = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'item-props.json')));

fs.writeFileSync(path.join(__dirname, '..', 'public', 'data', 'item-props.min.json'), JSON.stringify(props));

const grids = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'item-grids.json')));

fs.writeFileSync(path.join(__dirname, '..', 'public', 'data', 'item-grids.min.json'), JSON.stringify(grids));