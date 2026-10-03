import APIQuery from "../../modules/api-query.mjs";

class StatusQuery extends APIQuery {
    constructor() {
        super("status");
    }

    async query(options) {
        return this.apiRequest("status");
    }
}

const statusQuery = new StatusQuery();

const doFetchStatus = async (options) => {
    return statusQuery.run(options);
};

export default doFetchStatus;
