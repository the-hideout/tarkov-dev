const questInfo = require('../../src/data/quests.json');

module.exports = {
    getItemUsage: (id) => {
        let total = 0;
        let foundInRaid = 0;

        for(const quest of questInfo.data){
            for(const item of quest.items){
                if(item.id !== id){
                    continue;
                }

                total = total + item.count;
                if(item.foundInRaid){
                    foundInRaid = foundInRaid + item.count;
                }
            }
        }

        return {
            total: total,
            foundInRaid: foundInRaid,
        };
    }
}
