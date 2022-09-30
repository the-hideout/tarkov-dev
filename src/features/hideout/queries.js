import { useQuery } from 'react-query';
import doFetchHideout from './do-fetch-hideout';

import { langCode } from '../../modules/lang-helpers';
import { placeholderHideout } from '../../modules/placeholder-data';

export const useHideoutQuery = (queryOptions) => {
    const hideoutQuery = useQuery('hideout', () => doFetchHideout(), {
        refetchInterval: 600000,
        placeholderData: placeholderHideout(langCode()),
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        ...queryOptions,
    });

    return hideoutQuery;
};
