import rawData from './all-en.json';

const RotateItemsUids = [
  'e7aa5222-213f-456a-bc06-f8f40ad979b9',
  'c8f6ab75-7cbf-4e82-b0fe-46ec1a15c382',
  '8a9d698f-aa8a-450f-8737-70509185aa23',
  '23cd6ce1-4f19-4133-aa24-269f721ae76b',
  'f159cf91-480e-4f50-aab6-badb0850af5b',
  'aed566f6-dc68-4263-a933-061c645098fc',
  '9622c54f-7c61-4e2b-ae1a-153e889ef829',
  'd6f4d0af-9906-43b4-a5be-897eb9211c79',
  '6af1c257-a3ac-426a-8f4f-90dfaefd5a78',
  '6038fd0e-cb60-4595-8ede-6bea1263cf80',
  'e989ad9e-f9c8-4720-95e0-84ba111d2601',
  '38ee0fb0-095c-4d6f-9070-206627c70a02',
  'c22766d5-d8ae-4b54-aafd-48f651a05284',
  'bd0d4464-06a3-4485-9dfd-3731e3b4de76',
];
const RotateItemLookupMap = new Map();
RotateItemsUids.forEach((uid) => {
  RotateItemLookupMap.set(uid, true);
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

  if (RotateItemLookupMap.has(rawItem.uid)) {
    size = size.split('x').reverse().join('x');
  }

  return size;
};

const items = Object.fromEntries(
  rawData.map((rawItem) => {
    return [
      rawItem.uid,
      {
        uid: rawItem.uid,
        name: rawItem.name,
        shortName: rawItem.shortName,
        wikiLink: rawItem.wikiLink,
        imgLink: rawItem.imgLink,
        gridSize: getSize(rawItem),
        canCraftInHideout: false,
      },
    ];
  }),
);

export default items;
