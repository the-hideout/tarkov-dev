import { useItemByIdQuery } from '../../features/items/queries';
import { BitcoinItemId, GraphicCardItemId, ProduceBitcoinData } from './data';
import DataTable from '../../components/data-table';
import formatPrice from '../../modules/format-price';
import CenterCell from '../../components/center-cell';
import { useMemo } from 'react';
import { getDurationDisplay } from '../../modules/format-duration';
// import ProfitableGraph from './profitable-graph';

const { useTranslation } = require('react-i18next');

const ProfitInfo = ({ profitForNumCards, showDays = 100, fuelPricePerDay }) => {
    const { t } = useTranslation();

    const { data: bitcoinItem } = useItemByIdQuery(BitcoinItemId);
    const { data: graphicCardItem } = useItemByIdQuery(GraphicCardItemId);

    const data = useMemo(() => {
        if (!bitcoinItem || !graphicCardItem) {
            return [];
        }
        const btcSellPrice = bitcoinItem.sellFor?.[0].price ?? 0;
        const graphicsCardBuyPrice = graphicCardItem.buyFor?.[0].price ?? 0;

        return profitForNumCards.map((graphicCardsCount) => {
            const data = ProduceBitcoinData[graphicCardsCount];

            const graphicCardsCost = graphicsCardBuyPrice * graphicCardsCount;
            const btcRevenuePerDay = data.btcPerDay * btcSellPrice;
            const btcProfitPerDay = btcRevenuePerDay - fuelPricePerDay;

            let profitableDay;
            if (btcProfitPerDay > 0) {
                profitableDay = Math.ceil(graphicCardsCost / btcProfitPerDay);
            }

            const values = [];
            for (let day = 0; day <= showDays; day = day + 1) {
                const fuelCost = fuelPricePerDay * day;
                const revenue = btcRevenuePerDay * day;
                const profit = revenue - graphicCardsCost - fuelCost;

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
            };
        });
    }, [
        bitcoinItem,
        graphicCardItem,
        fuelPricePerDay,
        profitForNumCards,
        showDays,
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
                ]}
            />

            {/* <ProfitableGraph data={data} /> */}
        </>
    );
};

export default ProfitInfo;
