import { langCode } from '../../modules/lang-helpers';

const doFetchBosses = async () => {
    const language = await langCode();
    const bodyQuery = JSON.stringify({
        query: `{
            maps(lang: ${language}) {
                id
                tarkovDataId
                name
                normalizedName
                wiki
                description
                enemies
                raidDuration
                players
                bosses {
                    name
                    normalizedName
                    spawnChance
                    spawnLocations {
                        name
                        chance
                    }
                    escorts {
                        name
                        normalizedName
                        amount {
                            count
                            chance
                        }
                    }
                    spawnTime
                    spawnTimeRandom
                    spawnTrigger
                }
            }
        }`,
    });

    const response = await fetch('https://api.tarkov.dev/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: bodyQuery,
    });

    const bossData = await response.json();

    return bossData.data;
};

export default doFetchBosses;
