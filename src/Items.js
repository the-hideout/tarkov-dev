import rawData from './data/all-en.json';

const getSize = function sizeFromSlots(rawItem) {

  switch (rawItem.slots) {
    case 1:
        return {
            height: 1,
            width: 1,
        };
    case 2:
        if(rawItem.horizontal){
            return {
                height: 1,
                width: 2,
            };
        }

        return {
            height: 2,
            width: 1,
        };
    case 3:
        if(rawItem.horizontal){
            return {
                height: 1,
                width: 3,
            };
        }

        return {
            height: 3,
            width: 1,
        };
    case 4:
        return {
            height: 2,
            width: 2,
        };
    case 5:
        return {
            height: 1,
            width: 5,
        };
    case 6:
        if(rawItem.horizontal){
            return {
                height: 2,
                width: 3,
            };
        }

        return {
            height: 3,
            width: 2,
        };
    case 7:
        return {
            height: 1,
            width: 7,
        };
    case 8:
        return {
            height: 2,
            width: 4,
        };
    case 9:
        return {
            height: 3,
            width: 3,
        };
    case 10:
        return {
            height: 2,
            width: 5,
        };
    case 12:
        return {
            height: 4,
            width: 3,
        };
    case 15:
        return {
            height: 3,
            width: 5,
        };
    case 16:
        return {
            height: 4,
            width: 4,
        };
    case 20:
        return {
            height: 4,
            width: 5,
        };
    case 25:
        return {
            height: 5,
            width: 5,
        };
    case 30:
        return {
            height: 6,
            width: 5,
        };
    case 35:
        return {
            height: 7,
            width: 5,
        };
    case 42:
        return {
            height: 8,
            width: 4,
        };
    default:
      console.log(
        'could not get size for item with slots',
        rawItem.slots,
        rawItem,
      );
      return {
        height: 1,
        width: 1,
      };
  }
}

const items = Object.fromEntries(
  rawData.map((rawItem) => {
    return [
        rawItem.id,
        {
            id: rawItem.id,
            name: rawItem.name,
            shortName: rawItem.shortName,
            wikiLink: rawItem.wikiLink,
            // imgLink: rawItem.imgBig,
            imgLink: rawItem.img || `https://raw.githack.com/RatScanner/EfTIcons/master/uid/${rawItem.id}.png`,
            imgIconLink: `https://raw.githack.com/RatScanner/EfTIcons/master/uid/${rawItem.id}.png`,
            canCraftInHideout: false,
            types: rawItem.types,
            traderName: rawItem.traderName,
            traderPrice: rawItem.traderPrice,
            price: rawItem.price,
            fee: rawItem.fee,
            slots: rawItem.slots,
            horizontal: rawItem.horizontal,
            ...getSize(rawItem),
        },
    ];
  }),
);

export default items;
