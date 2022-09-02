function formatBossData(maps) {

    // Try to get the formatted boss data from session storage
    /*const dataObj = sessionStorage.getItem('boss-array-new');
    if (dataObj) {
        try {
            return JSON.parse(dataObj);
        } catch (e) {
            console.log(e);
        }
    }*/

    const bossArray = [];

    // Loop through each map
    for (const map of maps) {
        // Loop through each boss for each map
        for (const boss of map.bosses) {
            let savedBoss = bossArray.find(savedBoss => boss.normalizedName === savedBoss.normalizedName);
            if (!savedBoss) {
                savedBoss = {
                    name: boss.name,
                    normalizedName: boss.normalizedName,
                    escorts: boss.escorts,
                    maps: []

                };
                bossArray.push(savedBoss);
            }
            let bossMap = savedBoss.maps.find(savedMap => savedMap.id === map.id);
            if (!bossMap) {
                bossMap = {
                    name: map.name,
                    normalizedName: map.normalizedName,
                    id: map.id,
                    spawns: []
                }
                savedBoss.maps.push(bossMap);
            }
            bossMap.spawns.push({
                spawnChance: boss.spawnChance,
                locations: boss.spawnLocations
            });
        }
    }

    // Save to session storage and return the formatted boss data
    //sessionStorage.setItem('boss-array-new', JSON.stringify(bossArray));
    return bossArray;
}

export default formatBossData;
