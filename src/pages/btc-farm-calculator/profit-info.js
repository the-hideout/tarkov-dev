import { VictoryAxis, VictoryChart, VictoryLine, VictoryTheme } from 'victory';
import { useItemByIdQuery } from '../../features/items/queries';
import { BitcoinItemId, GraphicCardItemId, ProduceBitcoinData } from './data';
import DataTable from '../../components/data-table';
import formatPrice from '../../modules/format-price';
import CenterCell from '../../components/center-cell';
import { useMemo } from 'react';
import { getDurationDisplay } from '../../modules/format-duration';

const { useTranslation } = require('react-i18next');

const ShowDays = 100;

const ProfitInfo = ({ profitForNumCards = [1, 10, 25, 50] }) => {
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
            const btcRevenuePerHour = btcSellPrice * data.btcPerHour;
            const btcRevenuePerDay = btcSellPrice * data.btcPerHour * 24;

            let profitDay;
            const values = [];
            for (let day = 0; day <= ShowDays; day = day + 1) {
                const revenue = btcRevenuePerDay * day;
                const profit = revenue - graphicCardsCost;

                if (profit > 0 && profitDay === undefined) {
                    profitDay = day;
                }

                values.push({
                    x: day,
                    y: profit,
                });
            }

            return {
                ...data,
                graphicCardsCount,
                values,
                profitDay,
                graphicCardsCost,
                btcRevenuePerDay,
                btcRevenuePerHour,
            };
        });
    }, [bitcoinItem, graphicCardItem, profitForNumCards]);

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
                        Header: t('Estimated revenue/day'),
                        accessor: ({ btcRevenuePerDay }) =>
                            formatPrice(btcRevenuePerDay),
                        Cell: CenterCell,
                    },
                    {
                        Header: t('Profit after days'),
                        accessor: 'profitDay',
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

            <VictoryChart theme={VictoryTheme.material} height={200}>
                {data.map(({ graphicCardsCount, values }, index) => (
                    <VictoryLine key={graphicCardsCount} data={values} />
                ))}
                {data.map(({ profitDay, graphicCardsCount }) => {
                    return (
                        <VictoryAxis
                            axisValue={profitDay}
                            label={profitDay}
                            key={graphicCardsCount}
                        />
                    );
                })}
            </VictoryChart>
        </>
    );
};

export default ProfitInfo;
