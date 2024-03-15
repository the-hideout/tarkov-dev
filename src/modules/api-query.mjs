import graphqlRequest from './graphql-request.mjs';

class APIQuery {
    constructor(queryName) {
        this.name = queryName;
        this.pendingQuery = {};
    }

    graphqlRequest(queryString) {
        return graphqlRequest(queryString);
    }

    async query() {
        return Promise.reject('Not implemented');
    }

    async run(language = 'en', prebuild = false) {
        if (this.pendingQuery[language]) {
            return this.pendingQuery[language];
        }
        let resolvePending, rejectPending;
        this.pendingQuery[language] = new Promise((resolve, reject) => {
            resolvePending = resolve;
            rejectPending = reject;
        });
        try {
            const result = await this.query(language, prebuild);
            resolvePending(result);
            this.pendingQuery[language] = false;
            return result;
        } catch (error) {
            rejectPending(error);
            this.pendingQuery[language] = false;
            return Promise.reject(error);
        }
    }
}

export default APIQuery;
