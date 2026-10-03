import LZString from "lz-string";

import graphqlRequest from "./graphql-request.mjs";
import apiRequest from "./api-request.mjs";

const defaultOptions = {
    language: "en",
    gameMode: "regular",
    //prebuild: false,
};

class APIQuery {
    constructor(queryName, cacheMinutes = 5) {
        this.name = queryName;
        this.cacheTtl = cacheMinutes * 60 * 1000;
        this.pendingQuery = {};
    }

    apiRequest(path, options) {
        return apiRequest(path, options);
    }

    graphqlRequest(queryString, variables) {
        return graphqlRequest(queryString, variables);
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

        this.pendingQuery[storageKey] = this.query(options).finally(() => {
            this.pendingQuery[storageKey] = undefined;
        });
        return this.pendingQuery[storageKey];
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
                let cached;
                try {
                    cached = JSON.parse(value);
                } catch (error) {
                    cached = JSON.parse(LZString.decompress(value));
                }
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
