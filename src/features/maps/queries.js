// Queries used to get flea market fee factors, armor attributes,
// and item categories from the API
import { useQuery } from 'react-query';
import doFetchMaps from './do-fetch-maps';
import { langCode } from '../../modules/lang-helpers';
import { placeholderMaps } from '../../modules/placeholder-data';

export const useMapsQuery = (queryOptions) => {
    const mapsQuery = useQuery('maps', () => doFetchMaps(langCode()), {
        refetchInterval: 600000,
        placeholderData: placeholderMaps(langCode()),
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        ...queryOptions,
    });

    return mapsQuery;
};
