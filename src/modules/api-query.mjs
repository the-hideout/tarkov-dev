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

    graphqlRequest(queryString, variables) {
        return graphqlRequest(queryString, variables);
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
        this.pendingQuery[pendingKey] = this.query(options).finally(() => {
            this.pendingQuery[pendingKey] = undefined;
        });
        return this.pendingQuery[pendingKey];
    }
}

export default APIQuery;
