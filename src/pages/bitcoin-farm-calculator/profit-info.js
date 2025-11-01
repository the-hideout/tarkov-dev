import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import useItemsData from '../../features/items/index.js'
import useBartersData from '../../features/barters/index.js';
import useCraftsData from '../../features/crafts/index.js';
import { BitcoinItemId, GraphicCardItemId, getAllProduceBitcoinData } from './data.js';
import DataTable from '../../components/data-table/index.js';
import formatPrice from '../../modules/format-price.js';
import CenterCell from '../../components/center-cell/index.js';
import { getDurationDisplay } from '../../modules/format-duration.js';
import useHideoutData from '../../features/hideout/index.js';
import { selectAllStations } from '../../features/settings/settingsSlice.mjs';
import { averageWipeLength, currentWipeLength } from '../../modules/wipe-length.js';
import { getCheapestPrice } from '../../modules/format-cost-items.js';
// import ProfitableGraph from './profitable-graph';

const cardSlots = {
    1: 10,
    2: 25,
    3: 50,
};

const ProfitInfo = ({ profitForNumCards, showDays = 100, fuelPricePerDay, useBuildCosts, wipeDaysRemaining, gameMode, duration }) => {
    const stations = useSelector(selectAllStations);

    const { data: hideout } = useHideoutData();
    
    const { t } = useTranslation();

    const { data: items } = useItemsData();
    const { data: barters} = useBartersData();
    const { data: crafts } = useCraftsData();

    const settings = useSelector((state) => state.settings[state.settings.gameMode]);

    const bitcoinCraftDuration = useMemo(() => {
        if (!crafts?.length) {
            return 0
        }
        const btcStation = hideout?.find(s => s.normalizedName === 'bitcoin-farm');
        if (!btcStation) {
            return 0;
        }
        for (const craft of crafts) {
            //console.log(btcStation.id, craft.station.normalizedName, craft);
            if (craft.station.id !== btcStation.id) {
                continue;
            }
            return craft.duration;
        }
        return 0;
    }, [crafts, hideout]);

    const bitcoinProductionData = useMemo(() => {
        return getAllProduceBitcoinData(bitcoinCraftDuration)
    }, [bitcoinCraftDuration]);

    const bitcoinItem = useMemo(() => {
        return items.find(i => i.id === BitcoinItemId);
    }, [items]);

    const graphicCardItem = useMemo(() => {
        return items.find(i => i.id === GraphicCardItemId);
    }, [items]);

    const solarCost = useMemo(() => {
        const solar = hideout.find(station => station.normalizedName === 'solar-power');
        let buildCost = 0;
        for (const req of solar.levels[0].itemRequirements) {
            const item = items.find(i => i.id === req.item.id);
            if (!item) {
                continue;
            }
            const foundInRaid = req.attributes?.some(att => att.name === 'foundInRaid' && att.value === 'true');
            const cheapestObtainInfo = getCheapestPrice({...item, foundInRaid}, {barters, crafts, settings, useBarterIngredients: false, useCraftIngredients: false});
            if (item.id === '5449016a4bdc2d6f028b456f') {
                cheapestObtainInfo.pricePerUnit = 1;
            } else if (cheapestObtainInfo.type === 'none') {
                continue;
            }
            buildCost += cheapestObtainInfo.pricePerUnit * req.quantity;
        }
        return buildCost;
    }, [hideout, items, barters, crafts, settings]);
    
    const farmCosts = useMemo(() => {
        const farmData = hideout.find(station => station.normalizedName === 'bitcoin-farm');
        const farmCosts = {};
        for (const level of farmData.levels) {
            farmCosts[level.level] = 0;
            for (const req of level.itemRequirements) {
                const item = items.find(i => i.id === req.item.id);
                if (!item) {
                    continue;
                }
                const foundInRaid = req.attributes?.some(att => att.name === 'foundInRaid' && att.value === 'true');
                const cheapestObtainInfo = getCheapestPrice({...item, foundInRaid}, {barters, crafts, settings, useBarterIngredients: false, useCraftIngredients: false});
                if (item.id === '5449016a4bdc2d6f028b456f') {
                    cheapestObtainInfo.pricePerUnit = 1;
                } else if (cheapestObtainInfo.type === 'none') {
                    continue;
                }
                farmCosts[level.level] += cheapestObtainInfo.pricePerUnit * req.quantity;
            }
        }
        return farmCosts;
    }, [hideout, items, barters, crafts, settings]);

    const daysLeft = useMemo(() => {
        if (wipeDaysRemaining) {
            return wipeDaysRemaining;
        }
        return averageWipeLength() - currentWipeLength();
    }, [wipeDaysRemaining]);

    const data = useMemo(() => {
        if (!bitcoinItem || !graphicCardItem) {
            return [];
        }
        const btcSellPrice = bitcoinItem.priceCustom || bitcoinItem.sellFor?.reduce((bestPrice, currentPrice) => {
            if (bestPrice < currentPrice.priceRUB) {
                return currentPrice.priceRUB;
            }
            return bestPrice;
        }, 0);
        const graphicsCardBuyPrice = graphicCardItem.priceCustom || graphicCardItem.buyFor?.reduce((bestPrice, currentPrice) => {
            if (bestPrice === 0 || bestPrice > currentPrice.priceRUB) {
                return currentPrice.priceRUB;
            }
            return bestPrice;
        }, 0);

        return profitForNumCards.map((graphicCardsCount) => {
            const data = bitcoinProductionData[graphicCardsCount];
            if (!data) {
                return false;
            }

            const graphicCardsCost = graphicsCardBuyPrice * graphicCardsCount;
            const btcRevenuePerDay = data.btcPerDay * btcSellPrice;
            const btcProfitPerDay = btcRevenuePerDay - fuelPricePerDay;

            let buildCosts = 0;
            if (useBuildCosts) {
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
            }

            const totalCosts = graphicCardsCost + buildCosts;

            let profitableDay;
            if (btcProfitPerDay > 0) {
                profitableDay = Math.ceil(totalCosts / btcProfitPerDay);
            }

            let remainingProfit;
            if (profitableDay && daysLeft > profitableDay) {
                if (daysLeft > 0) {
                    remainingProfit = (daysLeft - profitableDay) * btcProfitPerDay;
                }
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
                remainingProfit,
            };
        }).filter(Boolean);
    }, [
        bitcoinItem,
        graphicCardItem,
        fuelPricePerDay,
        profitForNumCards,
        showDays,
        solarCost,
        farmCosts,
        stations,
        useBuildCosts,
        daysLeft,
        bitcoinProductionData,
    ]);

    if (data.length <= 0) {
        return null;
    }

    const columns = [
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
    ];
    if (useBuildCosts) {
        columns.push({
            Header: t('Build costs'),
            accessor: ({ buildCosts }) =>
                formatPrice(buildCosts),
            Cell: CenterCell,
        });
        columns.push({
            Header: t('GPU + build costs'),
            accessor: (data) =>
                formatPrice(data.graphicCardsCost + data.buildCosts),
            Cell: CenterCell,
        });
    }
    if (gameMode !== 'pve') {
        columns.push({
            Header: t('Remaining profit'),
            accessor: ({ remainingProfit }) =>
                formatPrice(remainingProfit),
            Cell: CenterCell,
        });
    }

    return (
        <>
            <DataTable
                key="bitcoin-farm-table"
                disableSortBy={true}
                data={data}
                columns={columns}
            />

            {/* <ProfitableGraph data={data} /> */}
        </>
    );
};

export default ProfitInfo;
