import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';

import { useItemByIdQuery } from '../../features/items/queries';
import { BitcoinItemId, GraphicCardItemId, ProduceBitcoinData } from './data';
import DataTable from '../../components/data-table';
import formatPrice from '../../modules/format-price';
import CenterCell from '../../components/center-cell';
import { getDurationDisplay } from '../../modules/format-duration';
import { useItemsQuery } from '../../features/items/queries';
import { selectAllHideoutModules, fetchHideout } from '../../features/hideout/hideoutSlice';
import { selectAllStations } from '../../features/settings/settingsSlice';
// import ProfitableGraph from './profitable-graph';

const cardSlots = {
    1: 10,
    2: 25,
    3: 50,
};

const ProfitInfo = ({ profitForNumCards, showDays = 100, fuelPricePerDay }) => {
    const stations = useSelector(selectAllStations);

    const itemsResult = useItemsQuery();
    const items = useMemo(() => {
        return itemsResult.data;
    }, [itemsResult]);

    const dispatch = useDispatch();
    const hideout = useSelector(selectAllHideoutModules);
    const hideoutStatus = useSelector((state) => {
        return state.hideout.status;
    });

    useEffect(() => {
        let timer = false;
        if (hideoutStatus === 'idle') {
            dispatch(fetchHideout());
        }

        if (!timer) {
            timer = setInterval(() => {
                dispatch(fetchHideout());
            }, 600000);
        }

        return () => {
            clearInterval(timer);
        };
    }, [hideoutStatus, dispatch]);
    
    const { t } = useTranslation();

    const { data: bitcoinItem } = useItemByIdQuery(BitcoinItemId);
    const { data: graphicCardItem } = useItemByIdQuery(GraphicCardItemId);

    const solarCost = useMemo(() => {
        const solar = hideout.find(station => station.normalizedName === 'solar-power');
        let buildCost = 0;
        for (const req of solar.levels[0].itemRequirements) {
            const item = items.find(i => i.id === req.item.id);
            const itemCost = item.buyFor.reduce((lowPrice, buyFor) => {
                if (!lowPrice || (buyFor.priceRUB && buyFor.priceRUB < lowPrice)) {
                    return buyFor.priceRUB;
                }
                return lowPrice;
            }, 0);
            buildCost += itemCost * req.quantity;
        }
        return buildCost;
    }, [hideout, items]);
    
    const farmCosts = useMemo(() => {
        const farmData = hideout.find(station => station.normalizedName === 'bitcoin-farm');
        const farmCosts = {};
        for (const level of farmData.levels) {
            farmCosts[level.level] = 0;
            for (const req of level.itemRequirements) {
                const item = items.find(i => i.id === req.item.id);
                const itemCost = item.buyFor.reduce((lowPrice, buyFor) => {
                    if (!lowPrice || (buyFor.priceRUB && buyFor.priceRUB < lowPrice)) {
                        return buyFor.priceRUB;
                    }
                    return lowPrice;
                }, 0);
                farmCosts[level.level] += itemCost * req.quantity;
            }
        }
        return farmCosts;
    }, [hideout, items]);

    const data = useMemo(() => {
        if (!bitcoinItem || !graphicCardItem) {
            return [];
        }
        const btcSellPrice = bitcoinItem.sellFor?.reduce((bestPrice, currentPrice) => {
            if (bestPrice < currentPrice.priceRUB) {
                return currentPrice.priceRUB;
            }
            return bestPrice;
        }, 0);
        const graphicsCardBuyPrice = graphicCardItem.buyFor?.reduce((bestPrice, currentPrice) => {
            if (bestPrice === 0 || bestPrice > currentPrice.priceRUB) {
                return currentPrice.priceRUB;
            }
            return bestPrice;
        }, 0);

        return profitForNumCards.map((graphicCardsCount) => {
            const data = ProduceBitcoinData[graphicCardsCount];

            const graphicCardsCost = graphicsCardBuyPrice * graphicCardsCount;
            const btcRevenuePerDay = data.btcPerDay * btcSellPrice;
            const btcProfitPerDay = btcRevenuePerDay - fuelPricePerDay;

            let buildCosts = 0;
            if (stations['solar-power'] === 1) {
                buildCosts += solarCost;
            }
            let farmLevelNeeded = 3;
            for (let i = Object.values(cardSlots).length; i > 0; i--) {
                if (cardSlots[i] < graphicCardsCount) {
                    break;
                }
                farmLevelNeeded = i;
            }
            for (let i = 1; i <= farmLevelNeeded; i++) {
                buildCosts += farmCosts[i];
            }

            const totalCosts = graphicCardsCost + buildCosts;

            let profitableDay;
            if (btcProfitPerDay > 0) {
                profitableDay = Math.ceil(totalCosts / btcProfitPerDay);
            }

            const values = [];
            for (let day = 0; day <= showDays; day = day + 1) {
                const fuelCost = fuelPricePerDay * day;
                const revenue = btcRevenuePerDay * day;
                const profit = revenue - totalCosts - fuelCost;

                values.push({
                    x: day,
                    y: profit,
                });
            }

            return {
                ...data,
                graphicCardsCount,
                values,
                profitableDay,
                graphicCardsCost,
                btcRevenuePerDay,
                fuelPricePerDay,
                btcProfitPerDay,
                buildCosts,
            };
        });
    }, [
        bitcoinItem,
        graphicCardItem,
        fuelPricePerDay,
        profitForNumCards,
        showDays,
        solarCost,
        farmCosts,
        stations,
    ]);

    if (data.length <= 0) {
        return null;
    }

    return (
        <>
            <DataTable
                disableSortBy={true}
                data={data}
                columns={[
                    {
                        Header: t('Num graphic cards'),
                        accessor: 'graphicCardsCount',
                    },

                    {
                        Header: t('Time to produce 1 bitcoin'),
                        accessor: ({ msToProduceBTC }) =>
                            getDurationDisplay(msToProduceBTC),
                        Cell: CenterCell,
                    },
                    {
                        Header: t('BTC/day'),
                        accessor: ({ btcPerDay }) => btcPerDay.toFixed(4),
                        Cell: CenterCell,
                    },
                    {
                        Header: t('Estimated profit/day'),
                        accessor: ({ btcProfitPerDay }) =>
                            formatPrice(btcProfitPerDay),
                        Cell: CenterCell,
                    },
                    {
                        Header: t('Profitable after days'),
                        accessor: 'profitableDay',
                        Cell: CenterCell,
                    },
                    {
                        Header: t('Total cost of graphic cards'),
                        accessor: ({ graphicCardsCost }) =>
                            formatPrice(graphicCardsCost),
                        Cell: CenterCell,
                    },
                    {
                        Header: t('Build costs'),
                        accessor: ({ buildCosts }) =>
                            formatPrice(buildCosts),
                        Cell: CenterCell,
                    },
                ]}
            />

            {/* <ProfitableGraph data={data} /> */}
        </>
    );
};

export default ProfitInfo;
