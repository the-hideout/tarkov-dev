import rawData from './all-en.json';

const sizeFromSlots = function sizeFromSlots(slots) {
    switch (slots){
        case 2:
            return `1x2`;
        case 3:
            return `1x3`;
        case 4:
            return `2x2`;
        case 6:
            return `2x3`;
        case 8:
            return `2x4`;
        case 9:
            return `2x2`;
        case 1:
        default:
            return `1x1`;
    };
};

const items = Object.fromEntries(rawData.map((rawItem) => {
    return [
        rawItem.uid,
        {
            uid: rawItem.uid,
            name: rawItem.name,
            shortName: rawItem.shortName,
            wikiUrl: rawItem.wikiLink,
            imgLink: rawItem.imgLink,
            gridSize: sizeFromSlots(rawItem.slots),
            canCraftInHideout: false,
        }
    ]
}));

export default items;
