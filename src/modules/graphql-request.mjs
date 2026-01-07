import { useQuery as reactUseQuery } from "@tanstack/react-query";

const apiUrlProd = "https://api.tarkov.dev/graphql";
const apiUrlDev = "https://dev-api.tarkov.dev/graphql";
const apiUrlLocal = "http://127.0.0.1:8787/graphql";
const apiUrl = apiUrlProd;

export default async function graphqlRequest(queryString, variables) {
    if (
        process.env.NODE_ENV === "production" &&
        apiUrl !== apiUrlProd &&
        apiUrlDev !== apiUrlProd &&
        apiUrlLocal !== apiUrlProd
    ) {
        // include the apiUrlDev/apiUrlLocal !== apiUrlProd check to avoid unused var warnings
        console.warn(`WARNING: YOU ARE USING THE DEV API ON PRODUCTION`);
    }
    return fetch(apiUrl, {
        method: "POST",
        headers: {
            //'Content-Type': 'application/json', // setting the Content-Type header prevents this from being a 'simple' request and results in an additional preflight OPTIONS request
            Accept: "application/json",
        },
        body: JSON.stringify({
            query: queryString.replace(/\s{2,}/g, " "),
            variables,
        }),
    }).then((response) => {
        if (!response.ok) {
            return Promise.reject(new Error(`${response.status}: ${response.statusText}`));
        }
        return response.json();
    });
}

export function useQuery(queryName, queryString, settings) {
    return reactUseQuery({
        queryKey: [queryName],
        queryFn: () => graphqlRequest(queryString, settings?.gqlVariables),
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        ...settings,
    });
}
