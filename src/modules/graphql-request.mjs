import { useQuery as reactUseQuery } from 'react-query';
import fetch  from 'cross-fetch';

const apiUrlProd = 'https://api.tarkov.dev/graphql';
const apiUrlDev = 'https://dev-api.tarkov.dev/graphql';
const apiUrlLocal = 'http://127.0.0.1:8787/graphql';
const apiUrl = apiUrlProd;

export default async function graphqlRequest(queryString) {
    if (process.env.NODE_ENV === 'production' && apiUrl !== apiUrlProd && apiUrlDev !== apiUrlProd && apiUrlLocal !== apiUrlProd) {
        // include the apiUrlDev/apiUrlLocal !== apiUrlProd check to avoid unused var warnings
        console.warn(`WARNING: YOU ARE USING THE DEV API ON PRODUCTION`);
    }
    return fetch(apiUrl, {
        method: 'POST',
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify({
            query: queryString
        }),
    }).then(response => {
        if (!response.ok) {
            return Promise.reject(new Error(`${response.status}: ${response.statusText}`));
        }
        return response.json();
    });
}

export function useQuery(queryName, queryString, settings) {
    settings = {
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        ...settings,
    };
    return reactUseQuery(
        queryName,
        () => graphqlRequest(queryString),
        settings,
    );
};