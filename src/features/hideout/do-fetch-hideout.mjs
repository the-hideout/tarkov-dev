import APIQuery from "../../modules/api-query.mjs";

class HideoutQuery extends APIQuery {
    constructor() {
        super("hideout");
    }

    async query(options) {
        const { language, gameMode, prebuild } = options;

        const [hideoutData] = await Promise.all([this.apiRequest(`${gameMode}/hideout`, { lang: language })]);

        const hideout = Object.values(hideoutData).map((station) => {
            for (const level of station.levels) {
                for (const req of level.itemRequirements) {
                    req.item = { id: req.item };
                    req.quantity = req.count;
                    req.attributes = Object.keys(req.attributes ?? []).map((attName) => {
                        return {
                            name: attName,
                            value: req.attributes[attName],
                        };
                    });
                }
                for (const req of level.stationLevelRequirements) {
                    req.station = {
                        id: req.station,
                        normalizedName: hideoutData[req.station].normalizedName,
                    };
                }
                for (const req of level.traderRequirements) {
                    req.trader = {
                        id: req.trader,
                    };
                    req.level = req.value;
                }
            }
            return station;
        });

        return hideout;
    }
}

const hideoutQuery = new HideoutQuery();

const doFetchHideout = async (options) => {
    return hideoutQuery.run(options);
};

export default doFetchHideout;
