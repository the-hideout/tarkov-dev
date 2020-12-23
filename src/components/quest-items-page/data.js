export const QuestObjective = {
  Find: 'Find',
  Kill: 'Kill',
};

export const Items = {
  BarsA2607: {
    id: 'BarsA2607',
    name: 'Bars A-2607',
    wikiUrl: 'https://escapefromtarkov.gamepedia.com/Bars_A-2607-_95x18',
    imgSrc:
      'https://static.wikia.nocookie.net/escapefromtarkov_gamepedia/images/8/8c/A-2607_Bars.png',
    gridSize: '2x1',
    canCraftInHideout: false,
  },
  GasAnalyzer: {
    id: 'GasAnalyzer',
    name: 'Gas analyzer',
    wikiUrl: 'https://escapefromtarkov.gamepedia.com/Gas_analyzer',
    imgSrc:
      'https://static.wikia.nocookie.net/escapefromtarkov_gamepedia/images/1/1d/Gas_Analyzer_Icon.png',
    gridSize: '1x2',
    canCraftInHideout: false,
  },
  LowerHalfMask: {
    id: 'LowerHalfMask',
    name: 'Lower half-mask',
    wikiUrl: 'https://escapefromtarkov.gamepedia.com/Lower_half-mask',
    imgSrc:
      'https://static.wikia.nocookie.net/escapefromtarkov_gamepedia/images/f/f4/Lower_half-mask_icon.png',
    gridSize: '1x1',
    canCraftInHideout: false,
  },
  Salewa: {
    id: 'Salewa',
    name: 'Salewa FIRST AID KIT',
    wikiUrl: 'https://escapefromtarkov.gamepedia.com/Salewa_FIRST_AID_KIT',
    imgSrc:
      'https://static.wikia.nocookie.net/escapefromtarkov_gamepedia/images/7/77/EFT_Salewa-First-Aid-Kit_Icon_2.png',
    gridSize: '1x2',
    canCraftInHideout: true,
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
    wikiUrl: 'https://escapefromtarkov.gamepedia.com/The_Punisher_-_Part_2',
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
};

export default Quests;
