import graphqlRequest from '../../modules/graphql-request.js';

const doFetchQuests = async (language, prebuild = false) => {
    const query = `{
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
                normalizedName
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
            traderRequirements {
                trader {
                    id
                    name
                }
                requirementType
                compareMethod
                value
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
                    containsCategory {
                        id
                        name
                        normalizedName
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
    }`;

    const questsData = await graphqlRequest(query);

    if (questsData.errors) {
        if (questsData.data) {
            for (const error of questsData.errors) {
                let badItem = false;
                if (error.path) {
                    badItem = questsData.data;
                    for (let i = 0; i < 2; i++) {
                        badItem = badItem[error.path[i]];
                    }
                }
                console.log(`Error in tasks API query: ${error.message}`);
                if (badItem) {
                    console.log(badItem)
                }
            }
        }
        // only throw error if this is for prebuild or data wasn't returned
        if (
            prebuild || !questsData.data || 
            !questsData.data.tasks || !questsData.data.tasks.length
        ) {
            return Promise.reject(new Error(questsData.errors[0].message));
        }
    }

    return questsData.data.tasks;
};

export default doFetchQuests;
