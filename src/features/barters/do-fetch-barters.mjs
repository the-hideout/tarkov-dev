import APIQuery from "../../modules/api-query.mjs";

class BartersQuery extends APIQuery {
    constructor() {
        super("barters");
    }

    async query(options) {
        const { language, gameMode } = options;

        const [bartersData] = await Promise.all([this.apiRequest(`${gameMode}/barters`)]);

        // convert to previous format
        return bartersData.map((barter) => {
            barter.trader = {
                id: barter.trader,
            };
            barter.level = barter.minTraderLevel;
            barter.requiredItems = barter.requiredItems.map((req) => {
                req.item = { id: req.item };
                req.attributes = Object.keys(req.attributes).map((attName) => {
                    return {
                        name: attName,
                        value: req.attributes[attName],
                    };
                });
                return req;
            });
            barter.rewardItems ??= [barter.offeredItem];
            barter.rewardItems = barter.rewardItems.map((req) => {
                req.item = { id: req.item };
                return req;
            });
            barter.taskUnlock = barter.taskUnlock ? { id: barter.taskUnlock } : null;
            return barter;
        });
    }
}

const bartersQuery = new BartersQuery();

const doFetchBarters = async (options) => {
    return bartersQuery.run(options);
};

export default doFetchBarters;
