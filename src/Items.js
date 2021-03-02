import rawData from './data/all-en.json';

const items = Object.fromEntries(
  rawData.map((rawItem) => {
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
            urlName: rawItem.urlName,
        },
    ];
  }),
);

export default items;
