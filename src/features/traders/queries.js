import { useQuery } from 'react-query';

import { langCode } from '../../modules/lang-helpers';
import doFetchTraders from './do-fetch-traders';

import { placeholderTraders } from '../../modules/placeholder-data';

export const useTradersQuery = (queryOptions) => {
    const tradersQuery = useQuery('traders', () => doFetchTraders(langCode()), {
        refetchInterval: 600000,
        placeholderData: placeholderTraders(langCode()),
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        ...queryOptions,
    });

    return tradersQuery;
};

export const useTraderByIdQuery = (traderId, queryOptions) => {
    const traderQuery = useTradersQuery({
        select: (traders) => traders.find((trader) => trader.id === traderId),
        ...queryOptions,
    });

    return traderQuery;
};

export const useTraderByNormalizedNameQuery = (traderName, queryOptions) => {
    const traderQuery = useTradersQuery({
        select: (traders) =>
            traders.find((trader) => trader.normalizedName === traderName),
        ...queryOptions,
    });

    return traderQuery;
};
