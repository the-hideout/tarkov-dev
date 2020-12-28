import rawData from './data/all-en.json';

const RotateItemsIds = [
    '5d0379a886f77420407aa271',
    '5bc9c1e2d4351e00367fbcf0',
    '5bc9c049d4351e44f824d360',
    '59e3556c86f7741776641ac2',
    '590c5f0d86f77413997acfab',
    '59faf98186f774067b6be103',
    '5b43575a86f77424f443fe62',
    '590de71386f774347051a052',
    '544fb45d4bdc2dee738b4568',
    '5e54f62086f774219b0f1937',
    '573478bc24597738002c6175',
    '59e3658a86f7741776641ac4',
    '590a3efd86f77437d351a25b',
    '59e358a886f7741776641ac3',
];
const RotateItemLookupMap = new Map();

RotateItemsIds.forEach((id) => {
  RotateItemLookupMap.set(id, true);
});

const getSize = function sizeFromSlots(rawItem) {
  let size;
  switch (rawItem.slots) {
    case 1:
      size = '1x1';
      break;
    case 2:
      size = '2x1';
      break;
    case 3:
      size = '3x1';
      break;
    case 4:
      size = '2x2';
      break;
    case 6:
      size = '3x2';
      break;
    case 8:
      size = '4x2';
      break;
    case 9:
      size = '3x3';
      break;
    case 10:
      size = '5x2';
      break;
    case 12:
      size = '3x4';
      break;
    case 35:
      size = '5x7';
      break;
    default:
      console.log(
        'could not get size for item with slots',
        rawItem.slots,
        rawItem,
      );
      size = '1x1';
      break;
  }

  if (RotateItemLookupMap.has(rawItem.bsgId)) {
    size = size.split('x').reverse().join('x');
  }

  return size;
};

const items = Object.fromEntries(
  rawData.map((rawItem) => {
    return [
        rawItem.bsgId,
        {
            id: rawItem.bsgId,
            uid: rawItem.uid,
            name: rawItem.name,
            shortName: rawItem.shortName,
            wikiLink: rawItem.wikiLink,
            // imgLink: rawItem.imgBig,
            // imgLink: rawItem.img,
            imgLink: `https://raw.githack.com/RatScanner/EfTIcons/master/uid/${rawItem.bsgId}.png`,
            gridSize: getSize(rawItem),
            canCraftInHideout: false,
        },
    ];
  }),
);

export default items;
