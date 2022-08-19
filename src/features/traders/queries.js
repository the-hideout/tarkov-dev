import { useQuery } from 'react-query';
import doFetchTraders from './do-fetch-traders';

export const useTradersQuery = (queryOptions) => {
    const tradersQuery = useQuery('traders', () => doFetchTraders(), {
        refetchInterval: 600000,
        placeholderData: [],
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
