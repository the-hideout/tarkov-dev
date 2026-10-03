import APIQuery from "../../modules/api-query.mjs";

class TradersQuery extends APIQuery {
    constructor() {
        super("traders");
    }

    async query(options) {
        const { language, gameMode } = options;
        const [tradersData] = await Promise.all([this.apiRequest(`${gameMode}/traders`, { lang: language })]);

        return Object.values(tradersData).map((trader) => {
            trader.currencyISO = trader.currency;
            return trader;
        });
    }
}

const tradersQuery = new TradersQuery();

const doFetchTraders = async (options) => {
    return tradersQuery.run(options);
};

export default doFetchTraders;
