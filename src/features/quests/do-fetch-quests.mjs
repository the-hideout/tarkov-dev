import APIQuery from "../../modules/api-query.mjs";

class QuestsQuery extends APIQuery {
    constructor() {
        super("quests");
    }

    async query(options) {
        const { language, gameMode } = options;

        const [questsData] = await Promise.all([this.apiRequest(`${gameMode}/tasks`, { lang: language })]);

        const fixObjective = (obj) => {
            obj.maps =
                obj.maps?.map((id) => {
                    return {
                        id,
                    };
                }) ?? [];
            for (const zone of obj.zones ?? []) {
                zone.map = { id: zone.map };
            }
            if (obj.item) {
                obj.item = { id: obj.item };
            }
            if (obj.items) {
                obj.items = obj.items.map((id) => {
                    return { id };
                });
            }
            if (obj.containsAll) {
                obj.containsAll = obj.containsAll.map((id) => {
                    return { id };
                });
            }
            if (obj.containsCategory) {
                obj.containsCategory = obj.containsCategory.map((id) => {
                    return {
                        id,
                        //name: itemsData.itemCategories[id].name,
                        //normalizedName: itemsData.itemCategories[id].normalizedName,
                    };
                });
            }
            if (obj.type === "hideoutStation") {
                obj.hideoutStation = { id: obj.station };
            }
            if (obj.markerItem) {
                obj.markerItem = { id: obj.markerItem };
            }
            for (const loc of obj.possibleLocations ?? []) {
                loc.map = { id: loc.map };
            }
            if (obj.zones) {
                obj.zoneNames = obj.zones
                    .map((zone) => {
                        return zone.name;
                    })
                    .filter(Boolean);
            }
            if (obj.usingWeapon) {
                obj.usingWeapon = obj.usingWeapon.map((id) => {
                    return { id };
                });
            }
            if (obj.usingWeaponMods) {
                obj.usingWeaponMods = obj.usingWeaponMods.map((modGroup) => {
                    return modGroup.map((id) => {
                        return { id };
                    });
                });
            }
            if (obj.buildAttributes) {
                obj.attributes = [];
                for (const attName in obj.buildAttributes) {
                    obj.attributes.push({
                        name: attName,
                        requirement: obj.buildAttributes[attName],
                    });
                }
                delete obj.buildAttributes;
            }
            if (obj.questItem) {
                const qItem = questsData.questItems[obj.questItem];
                obj.questItem = {
                    id: qItem.id,
                    name: qItem.name,
                    shortName: qItem.shortName,
                    width: qItem.width,
                    height: qItem.height,
                    iconLink: qItem.iconLink,
                    image512pxLink: qItem.image512pxLink,
                    baseImageLink: qItem.baseImageLink,
                    image8xLink: qItem.image8xLink,
                };
            }
            if (obj.skill) {
                obj.skillLevel = {
                    skill: {
                        id: obj.skill,
                    },
                    level: obj.level,
                };
            }
            if (obj.trader) {
                obj.trader = { id: obj.trader };
            }
            if (obj.task) {
                obj.task = { id: obj.task };
            }
        };

        const fixRewards = (rewards) => {
            for (const rew of rewards.traderStanding) {
                rew.trader = { id: rew.trader };
            }
            for (const rew of rewards.items) {
                rew.item = { id: rew.item, containsItems: [] };
            }
            for (const rew of rewards.offerUnlock) {
                rew.item = {
                    id: rew.item,
                };
            }
            for (const rew of rewards.skillLevelReward) {
                rew.name = rew.skill; //itemsData.skills.find(skill => skill.id === rew.skill).name;
            }
            for (const unlock of rewards.offerUnlock) {
                unlock.trader = { id: unlock.trader };
            }
            rewards.traderUnlock = rewards.traderUnlock.map((id) => {
                return { id };
            });
            for (const rew of rewards.craftUnlock) {
                rew.station = { id: rew.station };
                rew.rewardItems = [
                    {
                        item: { id: rew.item },
                        count: rew.count,
                    },
                ];
            }
            rewards.achievement = rewards.achievement.map((id) => {
                return { id };
            });
            for (const rew of rewards.customization) {
                if (rew.customizationType && rew.items) {
                    rew.items = rew.items.map((id) => {
                        return { id };
                    });
                }
            }
        };

        questsData.tasks = Object.values(questsData.tasks);
        for (const task of questsData.tasks) {
            task.trader = {
                id: task.trader,
            };
            if (task.map) {
                task.map = {
                    id: task.map,
                    //name: mapsData.maps[task.location].name,
                    //normalizedName: mapsData.maps[task.location].normalizedName,
                };
            }
            for (const req of task.taskRequirements) {
                req.task = {
                    id: req.task,
                };
            }
            for (const req of task.traderRequirements) {
                req.trader = {
                    id: req.trader,
                };
            }
            for (const nk of task.neededKeys ?? []) {
                nk.map = { id: nk.map };
                nk.keys = nk.keys.map((id) => {
                    return { id };
                });
            }
            for (const obj of task.objectives) {
                fixObjective(obj);
            }
            for (const cond of task.failConditions) {
                fixObjective(cond);
            }
            fixRewards(task.startRewards);
            fixRewards(task.finishRewards);
            fixRewards(task.failureOutcome);
        }

        for (const prestige of questsData.prestige) {
            for (const obj of prestige.conditions) {
                fixObjective(obj);
            }
            fixRewards(prestige.rewards);
            for (const transferSettings of prestige.transferSettings) {
                if (!transferSettings.itemFilters) {
                    continue;
                }
                transferSettings.itemFilters.allowedCategories = transferSettings.itemFilters.allowedCategories.map(
                    (id) => {
                        return { id };
                    },
                );
                transferSettings.itemFilters.allowedItems = transferSettings.itemFilters.allowedItems.map((id) => {
                    return { id };
                });
                transferSettings.itemFilters.excludedCategories = transferSettings.itemFilters.excludedCategories.map(
                    (id) => {
                        return { id };
                    },
                );
                transferSettings.itemFilters.excludedItems = transferSettings.itemFilters.excludedItems.map((id) => {
                    return { id };
                });
            }
        }

        questsData.questItems = Object.values(questsData.questItems);
        questsData.achievements = Object.values(questsData.achievements);

        return questsData;
    }
}

const questsQuery = new QuestsQuery();

const doFetchQuests = async (options) => {
    return questsQuery.run(options);
};

export default doFetchQuests;
