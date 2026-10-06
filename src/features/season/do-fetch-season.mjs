import APIQuery from "../../modules/api-query.mjs";

class SeasonQuery extends APIQuery {
    constructor() {
        super("season");
    }

    async query(options) {
        const { language } = options;

        return this.apiRequest("pvp-season/season", { lang: language });
    }
}

const seasonQuery = new SeasonQuery();

const doFetchSeason = async (options) => {
    return seasonQuery.run(options);
};

export default doFetchSeason;
