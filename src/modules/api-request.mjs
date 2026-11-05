import { JSONPath } from "jsonpath-plus";

const apiUrlProd = "https://json.tarkov.dev/";
const apiUrlDev = "https://json-dev.tarkov.dev/";
const apiUrl = apiUrlProd;

// "no-cache" makes the browser revalidate its cached copy with If-None-Match,
// so unchanged data comes back as a 304 without being downloaded again
const fetchResponse = (url) => {
    return fetch(url, {
        cache: "no-cache",
        headers: {
            Accept: "application/json",
        },
    }).then((response) => {
        if (!response.ok) {
            return Promise.reject(new Error(`${response.status} ${response.statusText}`));
        }
        return response;
    });
};

// Records the responses a query run is built from, so a later run can tell whether any of them changed
export class RequestContext {
    sources = [];
    prefetched = new Map();

    // Fetches the responses a previous run used and returns true if none have changed.
    // When something has changed, the responses are kept for the new run to use.
    async unchangedSince(previousSources) {
        // Last-Modified is one of the few headers readable on a cross-origin response; ETag isn't exposed
        if (!previousSources.length || previousSources.some((source) => !source.lastModified)) {
            return false;
        }
        const responses = await Promise.all(
            previousSources.map(async ({ url }) => {
                return [url, await fetchResponse(url)];
            }),
        );
        this.prefetched = new Map(responses);
        return previousSources.every(({ url, lastModified }) => {
            return this.prefetched.get(url).headers.get("last-modified") === lastModified;
        });
    }

    takePrefetched(url) {
        const response = this.prefetched.get(url);
        this.prefetched.delete(url);
        return response;
    }

    discardPrefetched() {
        for (const response of this.prefetched.values()) {
            response.body?.cancel();
        }
        this.prefetched.clear();
    }
}

const apiFetch = async (path, requestContext) => {
    const url = `${apiUrl}${path}`;
    const response = requestContext?.takePrefetched(url) ?? (await fetchResponse(url));
    requestContext?.sources.push({ url, lastModified: response.headers.get("last-modified") });
    return response.json();
};

export default async function apiRequest(path, options = {}) {
    const langFallback = options.langFallback ?? "en";
    const { requestContext } = options;
    // make the request plus any necessary translation requests
    const [responseData, langPrimaryData, langFallbackData] = await Promise.all([
        apiFetch(path, requestContext), // main data request
        new Promise((resolve, reject) => {
            if (!options.lang) {
                return resolve();
            }
            apiFetch(`${path}_${options.lang}`, requestContext).then(resolve).catch(reject);
        }),
        new Promise((resolve, reject) => {
            if (!options.lang || options.lang === langFallback) {
                return resolve({ data: {} });
            }
            apiFetch(`${path}_${langFallback}`, requestContext).then(resolve).catch(reject);
        }),
    ]);
    if (!langPrimaryData) {
        // no translation necessary
        return responseData.data;
    }
    // merge translations using jsonpath
    for (const jPath of responseData.translations ?? []) {
        try {
            JSONPath({
                path: jPath,
                json: responseData,
                resultType: "all",
                callback: (result) => {
                    const { path, value, parent, parentProperty } = result;
                    // try primary language first
                    // then try fallback
                    // then use the translation key if no translation available
                    parent[parentProperty] = langPrimaryData.data[value] ?? langFallbackData.data[value] ?? value;
                },
            });
        } catch (error) {
            console.error(error);
        }
    }
    return responseData.data;
}
