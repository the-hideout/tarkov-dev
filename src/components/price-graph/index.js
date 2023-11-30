import {
    VictoryChart,
    VictoryLine,
    VictoryTheme,
    VictoryAxis,
    // VictoryTooltip,
    VictoryVoronoiContainer,
    VictoryLegend,
} from 'victory';
import { useTranslation } from 'react-i18next';

import formatPrice from '../../modules/format-price';
import { useQuery } from '../../modules/graphql-request';
// import { getRelativeTimeAndUnit } from '../../modules/format-duration';

import './index.css';

function PriceGraph({ item, itemId }) {
    if (item && !itemId) {
        itemId = item.id;
        if (item.properties?.baseItem?.properties?.defaultPreset?.id === item.id) {
            itemId = item.properties.baseItem.id;
        }
    }
    
    const { t } = useTranslation();
    const { status, data } = useQuery(
        `historical-price-${itemId}`,
        `{
            historicalItemPrices(id:"${itemId}"){
                price
                priceMin
                timestamp
            }
        }`,
    );
    let height = VictoryTheme.material.height;

    if (window.innerWidth < 760) {
        height = 1280;
    }

    if (status !== 'success' || !data?.data?.historicalItemPrices) {
        return null;
    }

    if (status === 'success' && data.data.historicalItemPrices.length < 2) {
        return t('No data');
    }

    let max = 0;

    data.data.historicalItemPrices.forEach((price) => {
        if (price.price > max) {
            max = price.price;
        }
    });

    const avgDown = data.data.historicalItemPrices[0].price > data.data.historicalItemPrices[data.data.historicalItemPrices.length-1].price;
    const minDown = data.data.historicalItemPrices[0].priceMin > data.data.historicalItemPrices[data.data.historicalItemPrices.length-1].priceMin;

    return (
        <div className="price-history-wrapper">
            <VictoryChart
                height={height}
                width={1280}
                padding={{ top: 20, left: 15, right: 15, bottom: 30 }}
                minDomain={{ y: 0 }}
                maxDomain={{ y: max + max * 0.1 }}
                theme={VictoryTheme.material}
                containerComponent={
                    <VictoryVoronoiContainer
                        labels={({ datum }) => `${formatPrice(datum.y)}`}
                    />
                }
            >
                <VictoryAxis
                    tickFormat={(dateParsed) => {
                        // let relativeTime = getRelativeTimeAndUnit(dateParsed);
                        // 
                        // return t('{{val, relativetime}}', { val: relativeTime[0], range: relativeTime[1] })

                        return t('{{val, datetime}}', { val: dateParsed,
                            formatParams: {
                                val: { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' },
                            },
                        })
                    }}
                />
                <VictoryAxis dependentAxis/>
                <VictoryLine
                    padding={{ right: -120 }}
                    scale={{
                        x: 'time',
                        y: 'linear',
                    }}
                    style={{
                        data: {
                            stroke: avgDown ? '#c43a31' : '#3b9c3a',
                        },
                        parent: { border: '1px solid #ccc' },
                    }}
                    data={data.data.historicalItemPrices.map((pricePoint) => {
                        return {
                            x: new Date(Number(pricePoint.timestamp)),
                            y: pricePoint.price,
                        };
                    })}
                />
                <VictoryLine
                    padding={{ right: -120 }}
                    scale={{
                        x: 'time',
                        y: 'linear',
                    }}
                    style={{
                        data: {
                            stroke: minDown ? '#c43a31' : '#3b9c3a',
                            strokeDasharray: 5
                        },
                        parent: { border: '1px solid #ccc' },
                    }}
                    data={data.data.historicalItemPrices.map((pricePoint) => {
                        return {
                            x: new Date(Number(pricePoint.timestamp)),
                            y: pricePoint.priceMin,
                        };
                    })}
                />
            </VictoryChart>
        </div>
    );
}

export default PriceGraph;
