const fs = require('fs');
const path = require('path');

const got = require('got');

const traders = require('../src/data/traders.json');

const getTraderId = (id) => {
    for(const key in traders){
        if(traders[key].id === id){
            return key
        }
    }
    return false;
}

(async () => {
    console.log('Loading quests');
    console.time('quests');
    const data = await got('https://raw.githack.com/TarkovTracker/tarkovdata/master/quests.json', {
        responseType: 'json',
    });
    console.timeEnd('quests');

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
            if(objective.type !== 'find' && objective.type !== 'collect' && objective.type !== 'key' && objective.type !== 'place'){
                continue;
            }

            const findItem = {
                id: objective.target,
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
