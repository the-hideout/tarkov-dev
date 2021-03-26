import rawData from './data/all-en.json';
import itemGrids from './data/item-grids.json';

import bestPrice from './modules/best-price';
import calculateFee from './modules/flea-market-fee';

const NOTES = {
    '5e4abc6786f77406812bd572': 'Can only keep medical items',
};

const items = Object.fromEntries(
  rawData.map((rawItem) => {
    let grid = false;

    if(rawItem.hasGrid){
        let gridPockets = [{
            row: 0,
            col: 0,
            width: rawItem.itemProperties.grid.pockets[0].width,
            height: rawItem.itemProperties.grid.totalSize / rawItem.itemProperties.grid.pockets[0].width,
        }];

        if(itemGrids[rawItem.id]){
            gridPockets = itemGrids[rawItem.id];
        }

        grid = {
            height: rawItem.itemProperties.grid.totalSize / rawItem.itemProperties.grid.pockets[0].width,
            width: rawItem.itemProperties.grid.pockets[0].width,
            pockets: gridPockets,
        };

        if(gridPockets.length > 1){
            grid.height = Math.max(...gridPockets.map(pocket => pocket.row + pocket.height));
            grid.width = Math.max(...gridPockets.map(pocket => pocket.col + pocket.width)); 
        }

        // Rigs we haven't configured shouldn't break
        if(!itemGrids[rawItem.id] && !rawItem.types.includes('backpack')){
            grid = false;
        }
    }

    return [
        rawItem.id,
        {
            id: rawItem.id,
            name: rawItem.name,
            shortName: rawItem.shortName,
            wikiLink: rawItem.wikiLink,
            imgLink: rawItem.img || `https://assets.tarkov-tools.com/${rawItem.id}-grid-image.jpg`,
            types: rawItem.types,
            traderName: rawItem.traderName,
            traderPrice: rawItem.traderPrice,
            fee: calculateFee(rawItem.avg24hPrice, rawItem.basePrice),
            slots: rawItem.slots,
            itemProperties: rawItem.itemProperties,
            hasGrid: rawItem.hasGrid,
            ...bestPrice(rawItem),
            linkedItems: rawItem.linkedItems,
            basePrice: rawItem.basePrice,
            width: rawItem.width,
            height: rawItem.height,
            normalizedName: rawItem.normalizedName,
            grid: grid,
            notes: NOTES[rawItem.id],
            avg24hPrice: rawItem.avg24hPrice,
        },
    ];
  }),
);

export default items;
