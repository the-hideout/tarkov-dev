const itemData = require('../../src/data/bsg-all-raw.json');

// console.log(itemData);

module.exports = {
    getById: (id) => {
        console.log(itemData[id]);
        return itemData[id];
    },
};
