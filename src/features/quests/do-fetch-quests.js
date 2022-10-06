import fetch  from 'cross-fetch';

const doFetchQuests = async (language) => {
    const bodyQuery = JSON.stringify({
        query: `{
            tasks(lang: ${language}) {
                id
                tarkovDataId
                name
                normalizedName
                trader {
                    id
                    name
                    normalizedName
                }
                map {
                    id
                    name
                }
                experience
                wikiLink
                minPlayerLevel
                taskRequirements {
                    task {
                        id
                    }
                    status
                }
                traderLevelRequirements {
                    trader {
                        id
                        name
                    }
                    level
                }
                objectives {
                    __typename
                    id
                    type
                    description
                    maps {
                        id
                        name
                    }
                    optional
                    ...on TaskObjectiveBuildItem {
                        item {
                            id
                        }
                        containsAll {
                            id
                        }
                        containsOne {
                            id
                        }
                        attributes {
                            name
                            requirement {
                                compareMethod
                                value
                            }
                        }
                    }
                    ...on TaskObjectiveExperience {
                        healthEffect {
                            bodyParts
                            effects
                            time {
                                compareMethod
                                value
                            }
                        }
                    }
                    ...on TaskObjectiveExtract {
                        exitStatus
                        zoneNames
                    }
                    ...on TaskObjectiveItem {
                        item {
                            id
                        }
                        count
                        foundInRaid
                        dogTagLevel
                        maxDurability
                        minDurability
                    }
                    ...on TaskObjectiveMark {
                        markerItem {
                            id
                        }
                    }
                    ...on TaskObjectivePlayerLevel {
                        playerLevel
                    }
                    ...on TaskObjectiveQuestItem {
                        questItem {
                            id
                            name
                            shortName
                            width
                            height
                            iconLink
                            gridImageLink
                            image512pxLink
                        }
                        count
                    }
                    ...on TaskObjectiveShoot {
                        target
                        count
                        shotType
                        zoneNames
                        bodyParts
                        usingWeapon {
                            id
                        }
                        usingWeaponMods {
                            id
                        }
                        wearing {
                            id
                        }
                        notWearing {
                            id
                        }
                        distance {
                            compareMethod
                            value
                        }
                        playerHealthEffect {
                            bodyParts
                            effects
                            time {
                                compareMethod
                                value
                            }
                        }
                        enemyHealthEffect {
                            bodyParts
                            effects
                            time {
                                compareMethod
                                value
                            }
                        }
                    }
                    ...on TaskObjectiveSkill {
                        skillLevel {
                            name
                            level
                        }
                    }
                    ...on TaskObjectiveTaskStatus {
                        task {
                            id
                        }
                        status
                    }
                    ...on TaskObjectiveTraderLevel {
                        trader {
                            id
                        }
                        level
                    }
                }
                startRewards {
                    traderStanding {
                        trader {
                            id
                        }
                        standing
                    }
                    items {
                        item {
                            id
                            containsItems {
                                item {
                                    id
                                }
                                count
                            }
                        }
                        count
                        attributes {
                            name
                            value
                        }
                    }
                    offerUnlock {
                        trader {
                            id
                        }
                        level
                        item {
                            id
                        }
                    }
                    skillLevelReward {
                        name
                        level
                    }
                    traderUnlock {
                        id
                    }
                }
                finishRewards {
                    traderStanding {
                        trader {
                            id
                        }
                        standing
                    }
                    items {
                        item {
                            id
                            containsItems {
                                item {
                                    id
                                }
                                count
                            }
                        }
                        count
                        attributes {
                            name
                            value
                        }
                    }
                    offerUnlock {
                        trader {
                            id
                        }
                        level
                        item {
                            id
                        }
                    }
                    skillLevelReward {
                        name
                        level
                    }
                    traderUnlock {
                        id
                    }
                }
                factionName
                neededKeys {
                    keys {
                        id
                    }
                    map {
                        id
                    }
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

    const questsData = await response.json();

    if (questsData.errors) return Promise.reject(new Error(questsData.errors[0]));

    return questsData.data.tasks;
};

export default doFetchQuests;
