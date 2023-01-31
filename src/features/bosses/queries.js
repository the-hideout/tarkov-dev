// Queries used to get flea market fee factors, armor attributes,
// and item categories from the API
import { useMemo } from 'react';
import { useQuery } from 'react-query';
import doFetchBosses from './do-fetch-bosses';
import { langCode } from '../../modules/lang-helpers';
import { placeholderBosses } from '../../modules/placeholder-data';
import rawBossData from '../../data/boss.json';
import { useMapsQuery } from '../maps/queries';

export const useBossesQuery = (queryOptions) => {
    const mapsQuery = useQuery('bosses', () => doFetchBosses(langCode()), {
        refetchInterval: 600000,
        placeholderData: placeholderBosses(langCode()),
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        ...queryOptions,
    });

    return mapsQuery;
};

export const useBossDetails = () => {
    const mapsQuery = useMapsQuery();
    const maps = useMemo(() => {
        return mapsQuery.data;
    }, [mapsQuery]);

    const bossesQuery = useBossesQuery();
    const bosses = useMemo(() => {
        return bossesQuery.data;
    }, [bossesQuery]);

    let mergedBosses = useMemo(() => {
        for (const boss of bosses) {
            boss.maps = [];
            boss.spawnChanceOverride = [];
            const bossJson = rawBossData.find(json => json.normalizedName === boss.normalizedName);
            if (bossJson) {
                boss.details = bossJson.details;
                boss.wikiLink = bossJson.wikiLink;
                boss.behavior = bossJson.behavior;
                if (bossJson.spawnChanceOverride) {
                    boss.spawnChanceOverride = bossJson.spawnChanceOverride;
                }
            }
        }
        // Loop through each map
        for (const map of maps) {
            // Loop through each boss for each map
            for (const bossSpawn of map.bosses) {
                const boss = bosses.find(boss => boss.normalizedName === bossSpawn.normalizedName);
                if (!boss) {
                    continue;
                }
                let bossMap = boss.maps.find(savedMap => savedMap.id === map.id);
                if (!bossMap) {
                    bossMap = {
                        name: map.name,
                        normalizedName: map.normalizedName,
                        id: map.id,
                        escorts: bossSpawn.escorts,
                        spawns: []
                    }
                    boss.maps.push(bossMap);
                }
                bossMap.spawns.push({
                    spawnChance: bossSpawn.spawnChance,
                    locations: bossSpawn.spawnLocations
                });
            }
        }

        return bosses.sort((a, b) => a.name.localeCompare(b.name));
    }, [maps, bosses]);
    return mergedBosses;
};
