import { useMemo, useState } from 'react';
import {
    VictoryChart,
    VictoryLine,
    VictoryTheme,
    VictoryAxis,
    // VictoryTooltip,
    VictoryVoronoiContainer,
} from 'victory';
import { useTranslation } from 'react-i18next';
import Slider from 'rc-slider';

import formatPrice from '../../modules/format-price.js';
import { useQuery } from '../../modules/graphql-request.mjs';
// import { getRelativeTimeAndUnit } from '../../modules/format-duration.js';

import './index.css';

function PriceGraph({ item, itemId }) {
    if (item && !itemId) {
        itemId = item.id;
        if (item.properties?.baseItem?.properties?.defaultPreset?.id === item.id) {
            itemId = item.properties.baseItem.id;
        }
    }

    const [filterRange, setFilterRange] = useState([0,0]);
    
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

    const { dayTicks, tickLabels } = useMemo(() => {
        const returnValues = {
            dayTicks: [],
            tickLabels: {},
        };
        if (status !== 'success' || !data?.data?.historicalItemPrices) {
            return returnValues;
        }
        returnValues.dayTicks = data.data.historicalItemPrices.reduce((all, current) => {
            const newTimestamp = new Date(Number(current.timestamp)).setHours(0, 0, 0, 0);
            if (!all.some(currentTs => currentTs === newTimestamp)) {
                all.push(newTimestamp);
                const dateTime = new Date(newTimestamp);
                returnValues.tickLabels[newTimestamp] = `${dateTime.toLocaleString(navigator.language, {weekday: 'long'})}\n${dateTime.toLocaleString(navigator.language, {year: 'numeric', month: 'numeric', day: 'numeric'})}`
            }
            return all;
        }, []);
        if (data.data.historicalItemPrices.length > 0) {
            const firstTick = returnValues.dayTicks[0];
            returnValues.tickLabels[firstTick] = undefined;
            returnValues.dayTicks[0] = Number(data.data.historicalItemPrices[0].timestamp);
            returnValues.tickLabels[returnValues.dayTicks[0]] = '';
        }
        if (data.data.historicalItemPrices.length > 1) {
            const lastTick = Number(data.data.historicalItemPrices[data.data.historicalItemPrices.length-1].timestamp);
            returnValues.dayTicks.push(lastTick);
            returnValues.tickLabels[lastTick] = '';
        }
        return returnValues;
    }, [status, data]);

    const { filteredData, filteredMax, filteredMin, filteredAvgDown, filteredMinDown } = useMemo(() => {
        const returnValues = {
            filteredData: [],
            filteredMax: 0,
            filteredMin: 0,
            filteredAvgDown: false,
            filteredMinDown: false,
        };
        if (!data?.data?.historicalItemPrices) {
            return returnValues;
        }

        if (data.data.historicalItemPrices.length > 0) {
            const min = filterRange[0] ? filterRange[0] : Number(data.data.historicalItemPrices[0].timestamp);
            const max = filterRange[1] ? filterRange[1] : Number(data.data.historicalItemPrices[data.data.historicalItemPrices.length-1].timestamp);

            returnValues.filteredData = data.data.historicalItemPrices.filter(p => Number(p.timestamp) >= min && Number(p.timestamp) <= max);
        } else {
            returnValues.filteredData = data.data.historicalItemPrices;
        }
        
        returnValues.filteredMax = returnValues.filteredData.reduce((currMax, price) => {
            return Math.max(currMax, price.price)
        }, 0);

        returnValues.filteredMin = returnValues.filteredData.reduce((curMin, p) => {
            if (p.priceMin < curMin) {
                return p.priceMin;
            }
            return curMin;
        }, Number.MAX_SAFE_INTEGER);
        
        if (returnValues.filteredMin === Number.MAX_SAFE_INTEGER) {
            returnValues.filteredMin = 0;
        }

        if (returnValues.filteredData.length > 1) {
            returnValues.filteredAvgDown = returnValues.filteredData[0].price > returnValues.filteredData[returnValues.filteredData.length-1].price;
            returnValues.filteredMinDown = returnValues.filteredData[0].priceMin > returnValues.filteredData[returnValues.filteredData.length-1].priceMin;
        }

        return returnValues;
    }, [data, filterRange]);

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
                padding={{ top: 20, left: 15, right: 15, bottom: 45 }}
                minDomain={{ y: filteredMin - filteredMax * 0.1 }}
                maxDomain={{ y: filteredMax + filteredMax * 0.1 }}
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
                        return tickLabels[timestamp];
                    }}
                    tickValues={dayTicks}
                />
                <VictoryAxis dependentAxis/>
                <VictoryLine
                    //padding={{ right: -120 }}
                    scale={{
                        x: 'time',
                        y: 'linear',
                    }}
                    style={{
                        data: {
                            stroke: filteredAvgDown ? '#c43a31' : '#3b9c3a',
                        },
                        parent: { border: '1px solid #ccc' },
                    }}
                    data={filteredData.map((pricePoint) => {
                        return {
                            x: new Date(Number(pricePoint.timestamp)),
                            y: pricePoint.price,
                        };
                    })}
                />
                <VictoryLine
                    //padding={{ right: -120 }}
                    scale={{
                        x: 'time',
                        y: 'linear',
                    }}
                    style={{
                        data: {
                            stroke: filteredMinDown ? '#c43a31' : '#3b9c3a',
                            strokeDasharray: 5
                        },
                        parent: { border: '1px solid #ccc' },
                    }}
                    data={filteredData.map((pricePoint) => {
                        return {
                            x: new Date(Number(pricePoint.timestamp)),
                            y: pricePoint.priceMin,
                        };
                    })}
                />
            </VictoryChart>
            <div
                style={{
                    maxWidth: '90%',
                    margin: 'auto',
                    //marginLeft: '15px',
                    //marginRight: '30px',
                }}
            >
                <Slider
                    defaultValue={[dayTicks[0], data.data.historicalItemPrices[data.data.historicalItemPrices.length-1].timestamp]}
                    min={dayTicks[0]}
                    max={data.data.historicalItemPrices[data.data.historicalItemPrices.length-1].timestamp}
                    marks={dayTicks.reduce((allMarks, current) => {
                        allMarks[current] = true;//{label: new Date(current).toLocaleString(navigator.language, {weekday: 'long'})};
                        return allMarks;
                    }, {})}
                    onChange={setFilterRange}
                    trackStyle={{
                        backgroundColor: '#048802',
                    }}
                    handleStyle={{
                        backgroundColor: '#048802',
                        borderColor: '#048802',
                    }}
                    activeDotStyle={{
                        backgroundColor: '#048802',
                        borderColor: '#048802',
                    }}
                    reverse={false}
                    style={{
                        //top: '-7px',
                    }}
                    range={true}
                />
            </div>
        </div>
    );
}

export default PriceGraph;
