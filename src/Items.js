import rawData from './data/all-en.json';

const NOTES = {
    '5e4abc6786f77406812bd572': 'Can only keep medical items',
};

const GRID_MAP = {
    '5c0e805e86f774683f3dd637': [ // Paratus
        {
            row: 0,
            col: 0,
            width: 5,
            height: 5,
        },
        {
            row: 5,
            col: 0,
            width: 1,
            height: 2,
        },
        {
            row: 5,
            col: 1,
            width: 3,
            height: 2,
        },
        {
            row: 5,
            col: 4,
            width: 1,
            height: 2,
        },
    ],
    '5f5e46b96bdad616ad46d613': [ // Eberlestock
        {
            row: 0,
            col: 0,
            width: 5,
            height: 4,
        },
        {
            row: 4,
            col: 0,
            width: 5,
            height: 2,
        },
        {
            row: 6,
            col: 0,
            width: 5,
            height: 2,
        },
    ],
    '5d5d940f86f7742797262046': [ // Mechanism
        {
            row: 0,
            col: 0,
            width: 4,
            height: 4,
        },
        {
            row: 4,
            col: 0,
            width: 2,
            height: 2,
        },
        {
            row: 4,
            col: 2,
            width: 2,
            height: 2,
        },
        {
            row: 6,
            col: 0,
            width: 2,
            height: 2,
        },
        {
            row: 6,
            col: 2,
            width: 2,
            height: 2,
        },
    ],
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

        if(GRID_MAP[rawItem.id]){
            gridPockets = GRID_MAP[rawItem.id];
        }

        grid = {
            height: rawItem.itemProperties.grid.totalSize / rawItem.itemProperties.grid.pockets[0].width,
            width: rawItem.itemProperties.grid.pockets[0].width,
            pockets: gridPockets,
        };
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
            price: rawItem.price,
            fee: rawItem.fee,
            slots: rawItem.slots,
            itemProperties: rawItem.itemProperties,
            hasGrid: rawItem.hasGrid,
            bestPrice: rawItem.bestPrice,
            bestPriceFee: rawItem.bestPriceFee,
            linkedItems: rawItem.linkedItems,
            basePrice: rawItem.basePrice,
            width: rawItem.width,
            height: rawItem.height,
            normalizedName: rawItem.normalizedName,
            grid: grid,
            notes: NOTES[rawItem.id],
        },
    ];
  }),
);

export default items;
