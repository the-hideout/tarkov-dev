const fs = require('fs');
const path = require('path');

const items = require('./modules/items');

const rawData = require('../src/data/quests-raw.json');

const outputData = {
    updated: new Date(),
    data: [],
};

for(const rawQuest of rawData.data){
    // if(rawQuest.type !== 'PickUp'){
    //     continue;
    // }

    const questData = {
        questId: rawQuest._id,
        traderId: rawQuest.traderId,
        items: [],
    };

    for(const condition of rawQuest.conditions.AvailableForFinish){
        if(condition._parent !== 'FindItem'){
            continue;
        }

        const itemData = items.getById(condition._props.target[0]);

        if(itemData._props.QuestItem){
            continue;
        }

        if(itemData._props.Rarity === 'Not_exist'){
            continue;
        }

        console.log(itemData);

        questData.items.push({
            id: condition._props.target[0],
            name: itemData._props.Name,
            count: Number(condition._props.value),
            foundInRaid: condition._props.onlyFoundInRaid == true,
        })
    }

    if(questData.items.length === 0){
        continue;
    }

    outputData.data.push(questData);
}

fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'quests.json'), JSON.stringify(outputData, null, 4));
