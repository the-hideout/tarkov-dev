import APIQuery from "../../modules/api-query.mjs";

class MapsQuery extends APIQuery {
    constructor() {
        super("maps");
    }

    async query(options) {
        const { language, gameMode } = options;

        const [mapsData] = await Promise.all([this.apiRequest(`${gameMode}/maps`, { lang: language })]);

        for (const map of Object.values(mapsData.maps)) {
            for (const spawn of map.bosses) {
                spawn.id = spawn.mob;
                spawn.name = mapsData.mobs[spawn.mob].name;
                spawn.normalizedName = mapsData.mobs[spawn.mob].normalizedName;
                spawn.escorts = spawn.escorts.map((escort) => {
                    escort.id = escort.mob;
                    escort.name = mapsData.mobs[escort.mob].name;
                    escort.normalizedName = mapsData.mobs[escort.mob].normalizedName;
                    return escort;
                });
                if (spawn.switch) {
                    spawn.switch = {
                        id: spawn.switch,
                    };
                }
            }
            for (const extract of map.extracts) {
                extract.switches = extract.switches.map((switchId) => {
                    const sw = map.switches.find((s2) => s2.id === switchId);
                    if (!sw) {
                        return;
                    }
                    return {
                        id: switchId,
                        name: sw.name,
                    };
                });
                if (extract.transferItem) {
                    extract.transferItem.item = {
                        id: extract.transferItem.item,
                        //name: itemsData.items[extract.transferItem.item].name,
                        //normalizedName: itemsData.items[extract.transferItem.item].normalizedName,
                        //baseImageLink: itemsData.items[extract.transferItem.item].baseImageLink,
                    };
                }
            }
            for (const lock of map.locks) {
                lock.key = {
                    id: lock.key,
                };
            }
            for (const loot of map.lootContainers) {
                loot.lootContainer = {
                    id: loot.lootContainer,
                    name: mapsData.lootContainers[loot.lootContainer].name,
                    normalizedName: mapsData.lootContainers[loot.lootContainer].normalizedName,
                };
            }
            for (const loot of map.lootLoose) {
                loot.items = loot.items.map((id) => {
                    return { id };
                });
            }
            for (const sw of map.switches) {
                for (const activates of sw.activates) {
                    activates.target = {};
                    if (activates.extract) {
                        activates.target.id = activates.extract;
                        const extract = map.extracts.find((e) => e.id === activates.target.id);
                        activates.target.name = extract.name;
                        activates.target.faction = extract.faction;
                    }
                    if (activates.switch) {
                        activates.target.id = activates.switch;
                        const sw = map.switches.find((s) => s.id === activates.target.id);
                        activates.target.name = sw.name;
                    }
                }
            }
            for (const weap of map.stationaryWeapons) {
                const sw = mapsData.stationaryWeapons[weap.stationaryWeapon];
                weap.stationaryWeapon = {
                    name: sw.name,
                    shortName: sw.shortName,
                };
            }
        }

        for (const boss of Object.values(mapsData.mobs)) {
            if (boss.normalizedName === "knight") {
                boss.reports = mapsData.goonReports;
            }
            for (const equip of boss.equipment) {
                equip.item = {
                    id: equip.item,
                    containsItems: equip.contains.map((cont) => {
                        return {
                            item: { id: cont.item },
                            count: cont.count,
                            attributes: cont.attributes,
                        };
                    }),
                };
                equip.attributes = Object.keys(equip.attributes).map((attName) => {
                    return {
                        name: attName,
                        value: equip.attributes[attName],
                    };
                });
                delete equip.contains;
            }
            for (const equip of boss.items) {
                equip.item = { id: equip.item };
            }
        }

        mapsData.maps = Object.values(mapsData.maps);
        mapsData.mobs = Object.values(mapsData.mobs);

        return mapsData;
    }
}

const mapsQuery = new MapsQuery();

const doFetchMaps = async (options) => {
    return mapsQuery.run(options);
};

export default doFetchMaps;
