import apiRequest, { RequestContext } from "./api-request.mjs";

const defaultOptions = {
    language: "en",
    gameMode: "regular",
    //prebuild: false,
};

// Results handed back again by a refresh whose source data hadn't changed
const unchangedResults = new WeakSet();

// Reducers use this to skip storing (and reprocessing) a result they already have
export const isUnchangedResult = (result) => {
    return typeof result === "object" && result !== null && unchangedResults.has(result);
};

class APIQuery {
    constructor(queryName, cacheMinutes = 5) {
        this.name = queryName;
        this.cacheTtl = cacheMinutes * 60 * 1000;
        this.pendingQuery = {};
        this.lastResult = undefined;
    }

    apiRequest(path, options) {
        return apiRequest(path, options);
    }

    async query() {
        return Promise.reject("Not implemented");
    }

    async run(options = defaultOptions) {
        options = {
            ...defaultOptions,
            ...options,
        };
        const keyparts = ["api-cached-data", this.name];
        const keyprefix = keyparts.join("-");
        for (const variable in options) {
            keyparts.push(options[variable]);
        }
        const storageKey = keyparts.join("-");
        //console.log('querying new value', this.name);
        if (this.pendingQuery[storageKey]) {
            return this.pendingQuery[storageKey];
        }
        // remove previous local storage versions (probably other languages, gamemodes)
        this.removeCachedQueries(keyprefix);

        this.pendingQuery[storageKey] = this.runQuery(storageKey, options).finally(() => {
            this.pendingQuery[storageKey] = undefined;
        });
        return this.pendingQuery[storageKey];
    }

    async runQuery(storageKey, options) {
        const requestContext = new RequestContext();
        const previous = this.lastResult?.storageKey === storageKey ? this.lastResult : undefined;
        if (previous && (await requestContext.unchangedSince(previous.sources))) {
            requestContext.discardPrefetched();
            unchangedResults.add(previous.data);
            return previous.data;
        }

        // Subclasses call this.apiRequest without a request context, so give this run its own apiRequest
        const scopedQuery = Object.create(this, {
            apiRequest: {
                value: (path, requestOptions) => apiRequest(path, { ...requestOptions, requestContext }),
            },
        });
        try {
            const data = await this.query.call(scopedQuery, options);
            this.lastResult = { storageKey, data, sources: requestContext.sources };
            return data;
        } finally {
            requestContext.discardPrefetched();
        }
    }

    checkLocalStorage = () => {
        return typeof window !== "undefined";
    };

    checkCachedQuery = (storageKey) => {
        if (!this.checkLocalStorage()) {
            return;
        }
        try {
            const value = localStorage.getItem(storageKey);

            if (typeof value === "string") {
                const cached = JSON.parse(value);
                if (new Date() - cached.updated < this.cacheTtl) {
                    return cached.data;
                }
            }
        } catch (error) {
            /* noop */
        }

        return;
    };

    removeCachedQueries = (cacheKeyPrefix) => {
        if (!this.checkLocalStorage()) {
            return;
        }
        for (let i = 0; i < localStorage.length; i++) {
            const localStorageKey = localStorage.key(i);
            if (!localStorageKey.startsWith(cacheKeyPrefix)) {
                continue;
            }
            localStorage.removeItem(localStorageKey);
        }
    };
}

export default APIQuery;
