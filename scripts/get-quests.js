const fs = require('fs');
const path = require('path');

const got = require('got');

const allItems = require('../src/data/all-en.json');
const traders = require('../src/data/traders');

const formatName = (name) => {
    return name.toLowerCase().trim();
};

const getTraderId = (name) => {
    for(const key in traders){
        if(traders[key].name === name){
            return traders[key].id;
        }
    }

    return false;
}

(async () => {
    const data = await got('https://raw.githack.com/TarkovTracker/tarkovdata/master/quests.json', {
        responseType: 'json',
    });

    const questData = {
        updated: new Date(),
        data: [],
    };

    questLoop:
    for(const quest of data.body){
        const formattedQuestData = {
            questId: quest.id,
            traderId: getTraderId(quest.giver),
            name: quest.title,
            items: [],
        };

        for(const objective of quest.objectives){
            if(objective.type !== 'find' && objective.type !== 'collect'){
                continue;
            }

            const findItem = {
                id: allItems.find(item => formatName(item.name) === formatName(objective.target))?.id,
                name: objective.target,
                count: objective.number,
                foundInRaid: objective.type === 'find' ? true : false,
            };

            if(!findItem.id){
                console.warn(`Found no item matching ${objective.target}`);
                continue questLoop;
            }

            formattedQuestData.items.push(findItem);
        }

        if(formattedQuestData.items.length === 0){
            continue;
        }

        questData.data.push(formattedQuestData);
    }

    fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'quests.json'), JSON.stringify(questData, null, 4));
})();