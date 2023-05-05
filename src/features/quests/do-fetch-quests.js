import APIQuery from '../../modules/api-query.js';

class QuestsQuery extends APIQuery {
    constructor() {
        super('quests');
    }

    async query(language, prebuild = false) {
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
                restartable
                objectives {
                    ...TaskObjectiveInfo
                }
                failConditions {
                    ...TaskObjectiveInfo
                }
                startRewards {
                    ...taskRewardFragment
                }
                finishRewards {
                    ...taskRewardFragment
                }
                failureOutcome {
                    ...taskRewardFragment
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
                kappaRequired
                lightkeeperRequired
            }
        }
        fragment TaskObjectiveInfo on TaskObjective {
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
                exitName
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
                    baseImageLink
                    image8xLink
                }
                count
            }
            ...on TaskObjectiveShoot {
                target
                count
                shotType
                zoneNames
                bodyParts
                timeFromHour
                timeUntilHour
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
            ...on TaskObjectiveTraderStanding {
                trader {
                    id
                }
                compareMethod
                value
            }
            ...on TaskObjectiveUseItem {
                useAny {
                    id
                }
                compareMethod
                count
                zoneNames
            }
        }
        fragment taskRewardFragment on TaskRewards {
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
        }`;
    
        const questsData = await this.graphqlRequest(query);
    
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
    }
}

const questsQuery = new QuestsQuery();

const doFetchQuests = async (language, prebuild = false) => {
    return questsQuery.run(language, prebuild);
};

export default doFetchQuests;
