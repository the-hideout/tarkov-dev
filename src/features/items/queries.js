import { useQuery } from 'react-query';
import doFetchItems from './do-fetch-items';
import { langCode } from '../../modules/lang-helpers';

import { placeholderItems } from '../../modules/placeholder-data';

export const useItemsQuery = (queryOptions) => {
    const itemsQuery = useQuery('items', () => doFetchItems(langCode()), {
        refetchInterval: 600000,
        placeholderData: placeholderItems(langCode()),
        refetchOnMount: false,
        refetchOnWindowFocus: false,
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

export const useItemByNameQuery = (itemName, queryOptions) => {
    const itemQuery = useItemsQuery({
        select: (items) => items.find((item) => item.normalizedName === itemName),
        ...queryOptions,
    });

    return itemQuery;
};

export const useItemsWithTypeQuery = (type, queryOptions) => {
    const itemsQuery = useItemsQuery({
        select: (items) => items.filter((item) => item.types.includes(type)),
        ...queryOptions,
    });

    return itemsQuery;
};
