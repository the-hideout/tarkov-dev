// Queries used to get flea market fee factors, armor attributes,
// and item categories from the API
import { useQuery } from 'react-query';
import doFetchMeta from './do-fetch-meta';
import { langCode } from '../../modules/lang-helpers';
import { placeholderMeta } from '../../modules/placeholder-data';

export const useMetaQuery = (queryOptions) => {
    const metaQuery = useQuery('meta', () => doFetchMeta(langCode()), {
        refetchInterval: 600000,
        placeholderData: placeholderMeta(langCode()),
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        ...queryOptions,
    });

    return metaQuery;
};
