function formatBossData(bosses) {
    var duplicateCheck = [];
    var bossArray = [];
    for (const map of bosses.maps) {
        for (const boss of map.bosses) {
            if (!duplicateCheck.includes(boss.name)) {
                boss['map'] = new Set([map.name]);
                boss['map_id'] = new Set([map.id]);
                bossArray.push(boss);
                duplicateCheck.push(boss.name);
            } else {
                // Find the boss in the bossArray and add the map to the map array
                for (const bossData of bossArray) {
                    if (bossData.name === boss.name) {
                        bossData['map'].add(map.name);
                        bossData['map_id'].add(map.id);
                    }
                }
            }
        }
    }

    return bossArray;
}

export default formatBossData;
