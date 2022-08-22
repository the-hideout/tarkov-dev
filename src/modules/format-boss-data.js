function spawnLocations(boss, map) {
    var spawnLocations = [];

    for (const spawnLocation of boss.spawnLocations) {
        spawnLocations.push({
            name: spawnLocation.name,
            chance: spawnLocation.chance,
            map: map.name,
        });
    }

    return spawnLocations;
}

function formatBossData(bosses) {

    // Try to get the formatted boss data from session storage
    const dataObj = sessionStorage.getItem('boss-array-fmt');
    if (dataObj) {
        try {
            return JSON.parse(dataObj);
        } catch (e) {
            console.log(e);
        }
    }

    var duplicateCheck = [];
    var bossArray = [];

    // Loop through each map
    for (const map of bosses.maps) {
        // Loop through each boss for each map
        for (const boss of map.bosses) {
            // If the boss has already been added to the array, move on to the 'else' statement
            if (!duplicateCheck.includes(boss.name)) {
                boss['map'] = new Set([map.name]);
                boss['map_id'] = new Set([map.id]);
                boss['spawnLocations'] = spawnLocations(boss, map);

                bossArray.push(boss);
                duplicateCheck.push(boss.name);
            } else {
                // Find the boss in the bossArray and add the map to the map array
                for (const bossData of bossArray) {
                    if (bossData.name === boss.name) {
                        bossData['map'].add(map.name);
                        bossData['map_id'].add(map.id);

                        bossData['spawnLocations'] = bossData['spawnLocations'].concat(spawnLocations(boss, map));
                    }
                }
            }
        }
    }

    // Save to session storage and return the formatted boss data
    sessionStorage.setItem('boss-array-fmt', JSON.stringify(bossArray));
    return bossArray;
}

export default formatBossData;
