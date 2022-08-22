import { langCode } from '../../modules/lang-helpers';

const doFetchHideout = async () => {
    const language = await langCode();
    const bodyQuery = JSON.stringify({
        query: `{
            hideoutStations(lang: ${language}) {
                id
                name
                normalizedName
                levels {
                    level
                        itemRequirements {
                            quantity
                            item {
                                name
                                id
                                iconLink
                            }
                        } 
                    }
                }
            }`,
    });

    const response = await fetch('https://api.tarkov.dev/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: bodyQuery,
    });

    const queryData = await response.json();

    if (queryData.errors) return Promise.reject(new Error(queryData.errors[0]));

    return queryData.data.hideoutStations;
};

export default doFetchHideout;
