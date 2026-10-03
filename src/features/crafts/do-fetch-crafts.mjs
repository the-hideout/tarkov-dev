import APIQuery from "../../modules/api-query.mjs";

class CraftsQuery extends APIQuery {
    constructor() {
        super("crafts");
    }

    async query(options) {
        const { gameMode } = options;

        const [craftsData] = await Promise.all([this.apiRequest(`${gameMode}/crafts`)]);

        // convert to previous format
        return craftsData.map((craft) => {
            craft.station = {
                id: craft.station,
                //normalizedName: hideoutData[craft.station].normalizedName,
            };
            craft.requiredItems = craft.requiredItems.map((req) => {
                req.item = { id: req.item };
                req.attributes = Object.keys(req.attributes).map((attName) => {
                    return {
                        name: attName,
                        type: attName,
                        value: req.attributes[attName],
                    };
                });
                return req;
            });
            craft.rewardItems ??= [craft.productItem];
            craft.rewardItems = craft.rewardItems.map((req) => {
                req.item = { id: req.item };
                return req;
            });
            craft.taskUnlock = craft.taskUnlock ? { id: craft.taskUnlock } : null;
            return craft;
        });
    }
}

const craftsQuery = new CraftsQuery();

export default async function doFetchCrafts(options) {
    return craftsQuery.run(options);
}
