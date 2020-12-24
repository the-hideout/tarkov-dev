import Items from './Items';
import rawData from './quests.json';

export const QuestObjective = {
  Find: 'Find',
  Kill: 'Kill',
};

export const Traders = {
  Prapor: {
    id: 'Prapor',
    name: 'Prapor',
  },
  Therapist: {
    id: 'Therapist',
    name: 'Therapist',
  },
  Skier: {
    id: 'Skier',
    name: 'Skier',
  },
  PeaceKeeper: {
    id: 'Peacekeeper',
    name: 'Peacekeeper',
  },
  Mechanic: {
    id: 'Mechanic',
    name: 'Mechanic',
  },
  Ragman: {
    id: 'Ragman',
    name: 'Ragman',
  },
  Jaeger: {
    id: 'Jaeger',
    name: 'Jaeger',
  },
  Fence: {
    id: 'Fence',
    name: 'Fence',
  },
};

export const Maps = {
  Shorline: {
    id: 'Shorline',
    name: 'Shorline',
  },
};

const nameToId = function nameToId(questName) {
  return questName.replace(/[- ]/g, '');
};

export const Quests = rawData.data.map((questData) => {
  return {
    id: nameToId(questData.name),
    name: questData.name,
    wikiLink: 'https://escapefromtarkov.gamepedia.com/The_Punisher_-_Part_2',
    giver: Traders.Prapor,
    objectives: questData.items.map((itemData) => {
      return {
        type: QuestObjective.Find,
        amount: itemData.count,
        findInRaid: itemData.fir,
        targetUid: itemData.uid,
      };
    }),
  };
});

export default Quests;
