export const QuestObjective = {
  Find: 'Find',
  Kill: 'Kill',
};

export const Items = {
  BarsA2607: {
    id: 'BarsA2607',
    name: 'Bars A-2607',
    wikiLink: 'https://escapefromtarkov.gamepedia.com/Bars_A-2607-_95x18',
    imgLink:
      'https://static.wikia.nocookie.net/escapefromtarkov_gamepedia/images/8/8c/A-2607_Bars.png',
    gridSize: '2x1',
    canCraftInHideout: false,
  },
  CarBattery: {
    uid: '01da4b32-c57f-4c85-bcdf-a3c7a796cad4',
    name: 'Car battery',
    shortName: 'Battery',
    gridSize: '3x2',
    wikiLink: 'https://escapefromtarkov.gamepedia.com/Car_battery',
    imgLink:
      'https://gamepedia.cursecdn.com/escapefromtarkov_gamepedia/thumb/a/a0/Car_Battery_Icon.png/127px-Car_Battery_Icon.png?version=d8c81e29fdfd0762ff32fdfd806504e5',
  },
  GasAnalyzer: {
    id: 'GasAnalyzer',
    name: 'Gas analyzer',
    wikiLink: 'https://escapefromtarkov.gamepedia.com/Gas_analyzer',
    imgLink:
      'https://static.wikia.nocookie.net/escapefromtarkov_gamepedia/images/1/1d/Gas_Analyzer_Icon.png',
    gridSize: '1x2',
    canCraftInHideout: false,
  },
  LowerHalfMask: {
    id: 'LowerHalfMask',
    name: 'Lower half-mask',
    wikiLink: 'https://escapefromtarkov.gamepedia.com/Lower_half-mask',
    imgLink:
      'https://static.wikia.nocookie.net/escapefromtarkov_gamepedia/images/f/f4/Lower_half-mask_icon.png',
    gridSize: '1x1',
    canCraftInHideout: false,
  },
  MorphineInjector: {
    uid: '00e82880-064b-484c-9ebe-09befbfa4988',
    name: 'Morphine injector',
    shortName: 'Morphine',
    wikiLink: 'https://escapefromtarkov.gamepedia.com/Morphine_injector',
    imgLink:
      'https://gamepedia.cursecdn.com/escapefromtarkov_gamepedia/9/99/EFT_Morphine_Icon.png?version=c29006f631ea9b1fecd7dbbd8f47a102',
    gridSize: '1x1',
    canCraftInHideout: false,
  },
  PilgrimTouristBackpack: {
    uid: '82788622-7063-4723-9a27-7cd16d8af902',
    name: 'Pilgrim tourist backpack',
    shortName: 'Pilgrim',
    gridSize: '5x7',
    wikiLink: 'https://escapefromtarkov.gamepedia.com/Pilgrim_tourist_backpack',
    imgLink:
      'https://gamepedia.cursecdn.com/escapefromtarkov_gamepedia/thumb/f/fe/Pilgrim_Backpack_icon.png/75px-Pilgrim_Backpack_icon.png?version=5303a62c48dc9c66ebcd5039d79908e9',
  },
  Salewa: {
    id: 'Salewa',
    name: 'Salewa FIRST AID KIT',
    wikiLink: 'https://escapefromtarkov.gamepedia.com/Salewa_FIRST_AID_KIT',
    imgLink:
      'https://static.wikia.nocookie.net/escapefromtarkov_gamepedia/images/7/77/EFT_Salewa-First-Aid-Kit_Icon_2.png',
    gridSize: '1x2',
    canCraftInHideout: true,
  },
  SkiHatWithHolesForEyes: {
    uid: 'a36a5c6a-d05d-4fc0-923c-9f2ac2a7b890',
    name: 'Ski hat with holes for eyes',
    shortName: 'Shmaska',
    gridSize: '1x1',
    wikiLink:
      'https://escapefromtarkov.gamepedia.com/Ski_hat_with_holes_for_eyes',
    imgLink:
      'https://gamepedia.cursecdn.com/escapefromtarkov_gamepedia/2/24/ShmaskaIcon.png?version=ba23ee8a3f4b9c53d39a97d0c97323ed',
  },
  SparkPlug: {
    uid: '81b0a410-9d53-42ad-95ed-cd915d009f53',
    name: 'Spark Plug',
    shortName: 'Plug',
    gridSize: '1x1',
    wikiLink: 'https://escapefromtarkov.gamepedia.com/Spark_plug',
    imgLink:
      'https://gamepedia.cursecdn.com/escapefromtarkov_gamepedia/4/46/Spark_Plug_Icon_.png?version=5d679b96f39a59d595f8bf4763197f7b',
  },
};

export const Traders = {
  Prapor: { id: 'Prapor', name: 'Prapor' },
  Therapist: { id: 'Therapist', name: 'Therapist' },
  Skier: { id: 'Skier', name: 'Skier' },
  PeaceKeeper: { id: 'Peacekeeper', name: 'Peacekeeper' },
  Mechanic: { id: 'Mechanic', name: 'Mechanic' },
  Ragman: { id: 'Ragman', name: 'Ragman' },
  Jaeger: { id: 'Jaeger', name: 'Jaeger' },
  Fence: { id: 'Fence', name: 'Fence' },
};

export const Maps = {
  Shorline: {
    id: 'Shorline',
    name: 'Shorline',
  },
};

const Quests = {
  Debut: {
    id: 'Debut',
    name: 'Debut',
    giver: Traders.Prapor,
    objectives: [],
  },
  ThePunisherPart2: {
    id: 'ThePunisherPart2',
    name: 'The Punisher - Part 2',
    wikiLink: 'https://escapefromtarkov.gamepedia.com/The_Punisher_-_Part_2',
    giver: Traders.Prapor,
    objectives: [
      {
        type: QuestObjective.Kill,
        amount: 12,
        target: 'Scavs',
        location: [Maps.Shorline],
        text: 'Kill 12 Scavs at the Shoreline using a suppressed weapon',
      },
      {
        type: QuestObjective.Find,
        target: Items.LowerHalfMask,
        amount: 7,
        findInRaid: true,
      },
    ],
  },
  ThePunisherPart4: {
    id: 'ThePunisherPart4',
    name: 'The Punisher - Part 4',
    giver: Traders.Prapor,
    objectives: [
      {
        type: QuestObjective.Find,
        target: Items.BarsA2607,
        amount: 5,
        findInRaid: true,
      },
    ],
  },

  // Therapist
  Shortage: {
    id: 'Shortage',
    name: 'Shortage',
    giver: Traders.Therapist,
    objectives: [
      {
        type: QuestObjective.Find,
        target: Items.Salewa,
        amount: 5,
        findInRaid: false,
      },
    ],
  },
  SanitaryStandardsPart1: {
    id: 'SanitaryStandardsPart1',
    name: 'Sanitary Standards - Part 1',
    giver: Traders.Therapist,
    objectives: [
      {
        type: QuestObjective.Find,
        target: Items.GasAnalyzer,
        amount: 1,
        findInRaid: false,
      },
    ],
  },
  SanitaryStandardsPart2: {
    id: 'SanitaryStandardsPart2',
    name: 'Sanitary Standards - Part 2',
    giver: Traders.Therapist,
    objectives: [
      {
        type: QuestObjective.Find,
        target: Items.GasAnalyzer,
        amount: 2,
        findInRaid: true,
      },
    ],
  },
  Painkiller: {
    id: 'Painkiller',
    name: 'Painkiller',
    giver: Traders.Therapist,
    objectives: [
      {
        type: QuestObjective.Find,
        target: Items.MorphineInjector,
        amount: 4,
        findInRaid: true,
      },
    ],
  },
  CarRepair: {
    id: 'CarRepair',
    name: 'Car repair',
    giver: Traders.Therapist,
    objectives: [
      {
        type: QuestObjective.Find,
        target: Items.CarBattery,
        amount: 4,
        findInRaid: true,
      },
      {
        type: QuestObjective.Find,
        target: Items.SparkPlug,
        amount: 7,
        findInRaid: true,
      },
    ],
  },
  // Ragman
  SewItGoodPart1: {
    id: 'SewItGoodPart1',
    name: 'Sew it good - Part 1',
    giver: Traders.Ragman,
    objectives: [
      {
        type: QuestObjective.Find,
        target: Items.PilgrimTouristBackpack,
        amount: 1,
        findInRaid: true,
      },
      {
        type: QuestObjective.Find,
        target: Items.SkiHatWithHolesForEyes,
        amount: 1,
        findInRaid: true,
      },
    ],
  },
};

export default Quests;
