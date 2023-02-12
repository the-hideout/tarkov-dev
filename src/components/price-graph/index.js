import { useQuery } from 'react-query';
import {
    VictoryChart,
    VictoryLine,
    VictoryTheme,
    VictoryAxis,
    // VictoryTooltip,
    VictoryVoronoiContainer,
} from 'victory';
import { useTranslation } from 'react-i18next';

import formatPrice from '../../modules/format-price';
// import { getRelativeTimeAndUnit } from '../../modules/format-duration';

import './index.css';

function PriceGraph({ itemId, itemChange24 }) {
    const dataQuery = JSON.stringify({
        query: `{
            historicalItemPrices(id:"${itemId}"){
                price
                timestamp
            }
        }`,
    });
    
    const { t } = useTranslation();
    const { status, data } = useQuery(
        `historical-price-${itemId}`,
        () =>
            fetch('https://api.tarkov.dev/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: dataQuery,
            }).then((response) => response.json()),
        {
            refetchOnMount: false,
            refetchOnWindowFocus: false,
        },
    );
    let height = VictoryTheme.material.height;

    if (window.innerWidth < 760) {
        height = 1280;
    }

    if (status !== 'success') {
        return null;
    }

    if (status === 'success' && data.data.historicalItemPrices.length === 0) {
        return t('No data');
    }

    let max = 0;

    data.data.historicalItemPrices.map((price) => {
        if (price.price > max) {
            max = price.price;
        }

        return true;
    });

    return (
        <div className="price-history-wrapper">
            <VictoryChart
                height={height}
                width={1280}
                padding={{ top: 20, left: 15, right: -100, bottom: 30 }}
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
                            stroke: itemChange24 < 0.0 ? '#c43a31' : '#3b9c3a',
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
            </VictoryChart>
        </div>
    );
}

export default PriceGraph;
