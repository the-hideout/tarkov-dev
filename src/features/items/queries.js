import { useQuery } from 'react-query';
import doFetchItems from './do-fetch-items';

export const useItemsQuery = (queryOptions) => {
    const itemsQuery = useQuery('items', () => doFetchItems(), {
        refetchInterval: 600000,
        ...queryOptions,
    });

    return itemsQuery;
};

export const useItemByIdQuery = (itemId, queryOptions) => {
    const itemQuery = useItemsQuery({
        select: (items) => items.find((item) => item.id === itemId),
        ...queryOptions,
    });

    return itemQuery;
};
