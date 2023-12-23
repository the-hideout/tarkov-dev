import { useMemo } from 'react';
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
    const { dayTicks, max, min, avgDown, minDown } = useMemo(() => {
        const returnValues = {
            dayTicks: [],
            max: 0,
            min: 0,
            avgDown: false,
            minDown: false,
        };
        if (status !== 'success' || !data?.data?.historicalItemPrices|| data.data.historicalItemPrices.length < 2) {
            return returnValues;
        }
        returnValues.dayTicks = data.data.historicalItemPrices.reduce((all, current) => {
            const newTimestamp = new Date(Number(current.timestamp)).setHours(0, 0, 0, 0);
            if (!all.some(currentTs => currentTs === newTimestamp)) {
                all.push(newTimestamp);
            }
            return all;
        }, []);
        
        returnValues.max = data.data.historicalItemPrices.reduce((currMax, price) => {
            return Math.max(currMax, price.price)
        }, 0);

        returnValues.min = data.data.historicalItemPrices.reduce((curMin, p) => {
            if (p.priceMin < curMin) {
                return p.priceMin;
            }
            return curMin;
        }, Number.MAX_SAFE_INTEGER);

        returnValues.avgDown = data.data.historicalItemPrices[0].price > data.data.historicalItemPrices[data.data.historicalItemPrices.length-1].price;
        returnValues.minDown = data.data.historicalItemPrices[0].priceMin > data.data.historicalItemPrices[data.data.historicalItemPrices.length-1].priceMin;

        return returnValues;
    }, [status, data]);

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

    return (
        <div className="price-history-wrapper">
            <VictoryChart
                height={height}
                width={1280}
                padding={{ top: 20, left: 15, right: 15, bottom: 30 }}
                minDomain={{ y: min - max * 0.1 }}
                maxDomain={{ y: max + max * 0.1 }}
                theme={VictoryTheme.material}
                containerComponent={
                    <VictoryVoronoiContainer
                        labels={({ datum }) => `${formatPrice(datum.y)}\n${new Date(datum.x).toLocaleTimeString(navigator.language, {hour: '2-digit', minute: '2-digit', hour12: false})}`}
                    />
                }
            >
                <VictoryAxis
                    tickFormat={(timestamp) => {
                        // let relativeTime = getRelativeTimeAndUnit(timestamp);
                        // 
                        // return t('{{val, relativetime}}', { val: relativeTime[0], range: relativeTime[1] })
                        const dateTime = new Date(timestamp);
                        return `${dateTime.toLocaleString(navigator.language, {weekday: 'long'})}\n${dateTime.toLocaleString(navigator.language, {year: 'numeric', month: 'numeric', day: 'numeric'})}`;
                    }}
                    tickValues={dayTicks}
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
