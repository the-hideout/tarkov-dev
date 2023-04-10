import graphqlRequest from './graphql-request.js';

class APIQuery {
    constructor(queryName) {
        this.name = queryName;
        this.pendingQuery = false;
    }

    graphqlRequest(queryString) {
        return graphqlRequest(queryString);
    }

    async query() {
        return Promise.reject('Not implemented');
    }

    async run(language, prebuild = false) {
        if (this.pendingQuery) {
            return this.pendingQuery;
        }
        let resolvePending, rejectPending;
        this.pendingQuery = new Promise((resolve, reject) => {
            resolvePending = resolve;
            rejectPending = reject;
        });
        try {
            const result = await this.query(language, prebuild);
            resolvePending(result);
            this.pendingQuery = false;
            return result;
        } catch (error) {
            rejectPending(error);
            this.pendingQuery = false;
            return Promise.reject(error);
        }
    }
}

export default APIQuery;
