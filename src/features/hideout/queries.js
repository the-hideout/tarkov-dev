import { useQuery } from 'react-query';
import doFetchHideout from './do-fetch-hideout';

export const useHideoutQuery = (queryOptions) => {
    const questsQuery = useQuery('hideout', () => doFetchHideout(), {
        refetchInterval: 600000,
        placeholderData: [],
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        ...queryOptions,
    });

    return questsQuery;
};
