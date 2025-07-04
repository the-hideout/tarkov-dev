import { useMemo, useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
    VictoryChart,
    VictoryLine,
    VictoryTheme,
    VictoryAxis,
    // VictoryTooltip,
    VictoryVoronoiContainer,
} from 'victory';
import { useTranslation } from 'react-i18next';
import { Slider } from '@mui/material';

import formatPrice from '../../modules/format-price.js';
import graphqlRequest from '../../modules/graphql-request.mjs';
// import { getRelativeTimeAndUnit } from '../../modules/format-duration.js';

import './index.css';

function PriceGraph({ item, itemId, days }) {
    if (item && !itemId) {
        itemId = item.id;
        // if this is a default preset, use the base item's price data
        if (item.properties?.baseItem?.properties?.defaultPreset?.id === item.id) {
            itemId = item.properties.baseItem.id;
        }
    }
    if (!days) {
        days = 7;
    }

    const [filterRange, setFilterRange] = useState([0,0]);
    const [data, setPriceData] = useState();
    
    const { t } = useTranslation();
    const gameMode = useSelector((state) => state.settings.gameMode);
    const loadedItemId = useRef();

    useEffect(() => {
        if (loadedItemId.current !== itemId) {
            setPriceData({data: {itemPrices: []}});
        }
        graphqlRequest(
            `query TarkovDevPrices($itemId: ID!, $gameMode: GameMode) {
                itemPrices(id: $itemId, gameMode: $gameMode) {
                    price
                    priceMin
                    timestamp
                }
            }`,
            {itemId, gameMode},
        ).then(priceData => {
            if (!priceData?.data?.itemPrices) {
                if (priceData?.errors?.length) {
                    console.log(`Error retrieving historical prices`, priceData.errors);
                }
            } else {
                loadedItemId.current = itemId;
            }
            setPriceData(priceData);
            return priceData;
        }).catch(error => {
            console.log(`Error retrieving historical prices`, error);
            setPriceData({data: {itemPrices: []}});
        });
    }, [itemId, gameMode]);

    const daysData = useMemo(() => {
        if (!data?.data?.itemPrices) {
            return [];
        }
        const cutoffTimestamp = new Date().setDate(new Date().getDate() - days);
        return data.data.itemPrices.filter(scan => scan.timestamp >= cutoffTimestamp);
    }, [data, days]);

    const { dayTicks, tickLabels } = useMemo(() => {
        const returnValues = {
            dayTicks: [],
            tickLabels: {},
        };
        returnValues.dayTicks = daysData.reduce((all, current) => {
            const newTimestamp = new Date(Number(current.timestamp)).setHours(0, 0, 0, 0);
            if (!all.some(currentTs => currentTs === newTimestamp)) {
                all.push(newTimestamp);
                const dateTime = new Date(newTimestamp);
                returnValues.tickLabels[newTimestamp] = `${dateTime.toLocaleString(navigator.language, {weekday: 'long'})}\n${dateTime.toLocaleString(navigator.language, {year: 'numeric', month: 'numeric', day: 'numeric'})}`
            }
            return all;
        }, []);
        if (daysData.length > 0) {
            const firstTick = returnValues.dayTicks[0];
            returnValues.tickLabels[firstTick] = undefined;
            returnValues.dayTicks[0] = Number(daysData[0].timestamp);
            returnValues.tickLabels[returnValues.dayTicks[0]] = '';
        }
        if (daysData.length > 1) {
            const lastTick = Number(daysData[daysData.length-1].timestamp);
            returnValues.dayTicks.push(lastTick);
            returnValues.tickLabels[lastTick] = '';
        }
        return returnValues;
    }, [daysData]);

    const { filteredData, filteredMax, filteredMin, filteredAvgDown, filteredMinDown } = useMemo(() => {
        const returnValues = {
            filteredData: [],
            filteredMax: 0,
            filteredMin: 0,
            filteredAvgDown: false,
            filteredMinDown: false,
        };

        if (daysData.length > 0) {
            const min = filterRange[0] ? filterRange[0] : Number(daysData[0].timestamp);
            const max = filterRange[1] ? filterRange[1] : Number(daysData[daysData.length-1].timestamp);

            returnValues.filteredData = daysData.filter(p => Number(p.timestamp) >= min && Number(p.timestamp) <= max);
        } else {
            returnValues.filteredData = daysData;
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
    }, [daysData, filterRange]);

    let height = VictoryTheme.material.height;

    if (window.innerWidth < 760) {
        height = 1280;
    }

    if (!data?.data?.itemPrices) {
        return null;
    }

    if (daysData.length < 2) {
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
                        labels={({ datum }) => {
                            let timeLabel = '';
                            const thirtyDaysAgo = new Date();
                            thirtyDaysAgo.setDate(new Date().getDate() - 30);
                            if (new Date(datum.x) >= thirtyDaysAgo) {
                                timeLabel = `\n${new Date(datum.x).toLocaleTimeString(navigator.language, {hour: '2-digit', minute: '2-digit', hour12: false})}`;
                            }
                            return `${formatPrice(datum.y)}${timeLabel}\n${new Date(datum.x).toLocaleDateString(navigator.language, {dateStyle: 'short'})}`;
                        }}
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
                    fixLabelOverlap={true}
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
                            stroke: filteredAvgDown ? 'var(--color-green)' : 'var(--color-green)',
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
                            stroke: filteredMinDown ? 'var(--color-red)' : 'var(--color-green)',
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
                    defaultValue={[dayTicks[0], parseInt(data.data.itemPrices[data.data.itemPrices.length-1].timestamp)]}
                    min={dayTicks[0]}
                    max={parseInt(data.data.itemPrices[data.data.itemPrices.length-1].timestamp)}
                    marks={dayTicks.reduce((allMarks, current) => {
                        allMarks.push({label: '', value: current});
                        return allMarks;
                    }, [])}
                    onChange={(event, value) => {
                        setFilterRange(value);
                    }}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(timestamp) => new Date(timestamp ?? 0).toLocaleString(navigator.language, {hour: '2-digit', minute: '2-digit', hour12: false, year: 'numeric', month: 'numeric', day: 'numeric'})}
                />
            </div>
        </div>
    );
}

export default PriceGraph;
