function formatBossData(bosses) {
    var duplicateCheck = [];
    var bossArray = [];
    for (const map of bosses.maps) {
        for (const boss of map.bosses) {
            if (!duplicateCheck.includes(boss.name)) {
                boss['map'] = map.name;
                boss['map_id'] = map.id;
                bossArray.push(boss);
                duplicateCheck.push(boss.name);
            } 
        }
    }

    return bossArray;
}

export default formatBossData;
