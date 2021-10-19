import rawData from './data/quests.json';

import Traders from './data/traders.json';

export const QuestObjective = {
  Find: 'Find',
  Kill: 'Kill',
};

export const Maps = {
  Shorline: {
    id: 'Shorline',
    name: 'Shorline',
  },
};

export const Quests = rawData.data.map((questData) => {
  return {
    id: questData.questId,
    name: questData.name,
    wikiLink: 'https://escapefromtarkov.gamepedia.com/The_Punisher_-_Part_2',
    giver: Traders[questData.traderId],
    objectives: questData.items.map((itemData) => {
      return {
        type: QuestObjective.Find,
        amount: itemData.count,
        findInRaid: itemData.foundInRaid,
        targetId: itemData.id,
      };
    }),
  };
});

export default Quests;
