const fs = require('fs');
const path = require('path');

const got = require('got');

const itemIds = require('../src/data/items.json');

const mappingProperties = [
    'BlindnessProtection',
    'MaxDurability',
    'armorClass',
    'speedPenaltyPercent',
    'mousePenalty',
    'weaponErgonomicPenalty',
    'armorZone',
    'ArmorMaterial',
    'headSegments',
    'BlocksEarpiece',
    'DeafStrength',
    'RicochetParams',
    'Weight',
];

const getGrid = (item) => {
    if(!item._props.Grids){
        return false;
    }

    const gridData = {
        pockets: [],
        totalSize: 0,
    };

    for(const grid of item._props.Grids){
        gridData.totalSize = gridData.totalSize + grid._props.cellsH * grid._props.cellsV;
        gridData.pockets.push({
            height: grid._props.cellsV,
            width: grid._props.cellsH,
        });
    }

    return gridData;
};

let itemData = {};

const arrayChunk = (inputArray, chunkLength) => {
    return inputArray.reduce((resultArray, item, index) => {
        const chunkIndex = Math.floor(index / chunkLength);

        if(!resultArray[chunkIndex]) {
            resultArray[chunkIndex] = []; // start a new chunk
        }

        resultArray[chunkIndex].push(item);

        return resultArray
    }, []);
};

(async () => {
    let allItemData = [];
    let bsgData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'assets', 'bsg-data.json')));
    let tarkovToolsData = [];

    try {
        const chunks = arrayChunk(itemIds, 500);
        let i = 1;
        for(const chunk of chunks){
            console.time(`tt-api-chunk-${i}`);
            const bodyQuery = JSON.stringify({query: `{
                    ${chunk.map((itemId) => {
                        return `item${itemId}: item(id:"${itemId}"){
                            id
                            name
                            shortName
                            basePrice
                            normalizedName
                            types
                            width
                            height
                            avg24hPrice
                            wikiLink
                            traderPrices {
                                price
                                trader {
                                    name
                                }
                            }
                        }`;
                    }).join('\n') }
                }`
            });
            const response = await got.post('https://tarkov-tools.com/graphql', {
                body: bodyQuery,
                responseType: 'json',
            });
            console.timeEnd(`tt-api-chunk-${i}`);

            tarkovToolsData = tarkovToolsData.concat(Object.values(response.body.data));
            i = i + 1;
        }

    } catch (requestError){
        console.error(requestError);

        // We wan't CI to stop here
        process.exit(1);
    }

    for(const item of tarkovToolsData){
        itemData[item.id] = item;
    }

    const languageCode = 'en';
    for(const itemId in itemData){
        const bsgItemData = bsgData[itemId];
        const bestTraderPrice = itemData[itemId].traderPrices.sort((a, b) => {
            if(a.price > b.price) {
                return -1;
            }

            if(a.price < b.price) {
                return 1;
            }

            return 0;
        }).shift();

        console.log(bestTraderPrice);

        const item = {
            types: [],
            ...itemData[itemId],
            price: itemData[itemId].avg24hPrice,
            traderPrice: bestTraderPrice?.price || 0,
            traderName: bestTraderPrice?.trader?.name || '?',
            itemProperties: {},
            hasGrid: bsgItemData._props.Grids?.length > 0,
            linkedItems: bsgItemData._props.Slots?.map((slot) => {
                return slot._props.filters[0].Filter;
            }).flat() || [],
        };

        for(const extraProp of mappingProperties){
            if(!bsgItemData._props[extraProp]){
                continue;
            }

            item.itemProperties[extraProp] = bsgItemData._props[extraProp];
        }

        item.itemProperties.grid = getGrid(bsgItemData);
        item.wikiLink = item.wikiLink.replace('https://escapefromtarkov.gamepedia.com', '');

        allItemData.push(item);
    }

    fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', `all-${languageCode}.json`), JSON.stringify(allItemData, null, 4));
})();
