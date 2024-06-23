import graphqlRequest from './graphql-request.mjs';

const defaultOptions = {
    language: 'en',
    gameMode: 'regular',
    prebuild: false,
};

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

    async run(options = defaultOptions) {
        options = {
            ...defaultOptions,
            ...options,
        };
        const pendingKey = options.language+options.gameMode;
        if (this.pendingQuery[pendingKey]) {
            return this.pendingQuery[pendingKey];
        }
        let resolvePending, rejectPending;
        this.pendingQuery[pendingKey] = new Promise((resolve, reject) => {
            resolvePending = resolve;
            rejectPending = reject;
        });
        try {
            const result = await this.query(options);
            resolvePending(result);
            this.pendingQuery[pendingKey] = false;
            return result;
        } catch (error) {
            rejectPending(error);
            this.pendingQuery[pendingKey] = false;
            return Promise.reject(error);
        }
    }
}

export default APIQuery;
