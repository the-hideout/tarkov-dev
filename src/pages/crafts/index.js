import {useMemo, useState} from 'react';
import {Helmet} from 'react-helmet';
import Switch from 'react-switch';

import DataTable from '../../components/data-table';
import formatPrice from '../../modules/format-price';
import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage'

import rawData from '../../data/crafts.json';

import './index.css';

function priceCell({ value }) {
    return <div
        className = 'center-content'
    >
        {formatPrice(value)}
    </div>;
};

function costItemsCell({ value }) {
    return <div
        className = 'cost-wrapper'
    >
        {value.map((costItem, itemIndex) => {
            return <div
                key = {`cost-item-${itemIndex}`}
                className = 'craft-cost-item-wrapper'
            >
                <div
                    className = 'craft-cost-image-wrapper'
                >
                    <img
                        alt = {costItem.name}
                        loading = 'lazy'
                        src = {costItem.iconLink}
                    />
                </div>
                <div
                    className = 'craft-cost-item-text-wrapper'
                >
                    <a
                        href = {costItem.wikiLink}
                    >
                        {costItem.name}
                    </a>
                    <div
                        className = 'price-wrapper'
                    >
                        <span className = 'craft-cost-item-count-wrapper'>{costItem.count}</span> X {formatPrice(costItem.price)} = {formatPrice(costItem.count * costItem.price)}
                        {/* {formatPrice(costItem.price)} */}
                    </div>
                </div>
            </div>
        })}
    </div>;
};

function Crafts() {
    const [nameFilter, setNameFilter] = useState('');
    const [topPerStationOnly, setTopPerStationOnly] = useStateWithLocalStorage('showTopPerStationOnly', false);

    const columns = useMemo(
        () => [
            {
                Header: 'Reward',
                accessor: 'reward',
                Cell: ({ value }) => {
                    return <div
                        className = 'craft-reward-wrapper'
                    >
                        <div
                            className = 'craft-reward-image-wrapper'
                        >
                            <img
                                alt = ''
                                className = 'table-image'
                                loading = 'lazy'
                                src = { value.iconLink }
                            />
                        </div>
                        <div
                            className = 'craft-reward-info-wrapper'
                        >
                            <div>
                                <a
                                    className = 'craft-reward-item-title'
                                    href={value.wikiLink}

                                >
                                    {value.name}
                                </a>
                            </div>
                            <div
                                className = 'source-wrapper'
                            >
                                {value.source}
                            </div>
                            <div
                                className = 'price-wrapper'
                            >
                                {formatPrice(value.value)}
                            </div>
                        </div>
                    </div>
                },
            },
            {
                Header: 'Cost',
                accessor: 'costItems',
                Cell: costItemsCell,
            },
            {
                Header: 'Cost ₽',
                accessor: d => Number(d.cost),
                Cell: priceCell,
                id: 'cost',
            },
            {
                Header: 'Estimated profit',
                accessor: d => Number(d.profit),
                Cell: priceCell,
                id: 'profit',
                sortType: (a, b) => {
                    if(a.value > b.value){
                        return 1;
                    }

                    if(a.value < b.value){
                        return -1;
                    }

                    return 0;
                },
            },
        ],
        []
    )

    const data = useMemo(() => {
        let addedStations = [];
        return rawData.map((craftRow) => {
            let totalCost = 0;

            if(!craftRow.rewardItems[0]){
                console.log(craftRow);
                return false;
            }

            if(nameFilter.length > 0){
                let matchesFilter = false;
                const findString = nameFilter.toLowerCase().replace(/\s/g, '');
                for(const requiredItem of craftRow.requiredItems){
                    if(requiredItem === null){
                        continue;
                    }

                    if(requiredItem.item.name.toLowerCase().replace(/\s/g, '').includes(findString)){
                        matchesFilter = true;

                        break;
                    }
                }

                for(const rewardItem of craftRow.rewardItems){
                    if(rewardItem.item.name.toLowerCase().replace(/\s/g, '').includes(findString)){
                        matchesFilter = true;

                        break;
                    }
                }

                if(!matchesFilter){
                    return false;
                }
            }

            let hasZeroCostItem = false;
            const [station, level] = craftRow.source.split('level');

            const tradeData = {
                costItems: craftRow.requiredItems.map(requiredItem => {
                        totalCost = totalCost + requiredItem.item.avg24hPrice * requiredItem.count;

                        if(requiredItem.item.avg24hPrice * requiredItem.count === 0){
                            hasZeroCostItem = true;
                        }

                        return {
                            count: requiredItem.count,
                            name: requiredItem.item.name,
                            price: requiredItem.item.avg24hPrice,
                            iconLink: requiredItem.item.iconLink,
                            wikiLink: requiredItem.item.wikiLink,
                        };
                    })
                    .filter(Boolean),
                cost: totalCost,
                reward: {
                    name: craftRow.rewardItems[0].item.name,
                    wikiLink: craftRow.rewardItems[0].item.wikiLink,
                    value: craftRow.rewardItems[0].item.avg24hPrice,
                    source: station,
                    iconLink: craftRow.rewardItems[0].item.iconLink,
                },
                profit: (craftRow.rewardItems[0].item.avg24hPrice * craftRow.rewardItems[0].count) - totalCost,
            };

            // If the reward has no value, it's not available for purchase
            if(tradeData.reward.value === 0){
                tradeData.reward.value = tradeData.cost;
                tradeData.reward.barterOnly = true;
                tradeData.profit = 0;
            }

            if(hasZeroCostItem){
                return false;
            }

            return tradeData;
        })
        .filter(Boolean)
        .sort((itemA, itemB) => {
            if(itemB.profit < itemA.profit){
                return -1;
            };

            if(itemB.profit > itemA.profit){
                return 1;
            }

            return 0;
        })
        .map((craft) => {
            if(!topPerStationOnly){
                return craft;
            }

            if(addedStations.includes(craft.reward.source)){
                return false;
            }

            addedStations.push(craft.reward.source);

            return craft;
        })
        .filter(Boolean)
    },
        [nameFilter, topPerStationOnly]
    );

    return [
        <Helmet
            key = {'loot-tier-helmet'}
        >
            <meta
                charSet='utf-8'
            />
            <title>
                Escape from Tarkov Hideout craft profits
            </title>
            <meta
                name = 'description'
                content = 'Escape from Tarkov Hideout craft profits'
            />
        </Helmet>,
        <div
            className = 'data-table-filters-wrapper'
            key = 'crafts-filters'
        >
            <h1
                className = 'crafts-page-title'
            >
                Hideout craft profits
            </h1>
            <label
                className = {'filter-toggle-wrapper'}
            >
                <div
                    className = {'filter-toggle-label'}
                >
                    Show top per station
                </div>
                <Switch
                    className = {'filter-toggle'}
                    onChange = {e => setTopPerStationOnly(!topPerStationOnly)}
                    checked = {topPerStationOnly}
                />
            </label>
            <div
                className = 'filter-input-wrapper'
            >
                <div
                    className = 'filter-input-label'
                >
                    Item filter
                </div>
                <input
                    defaultValue = {nameFilter || ''}
                    type = {'text'}
                    placeholder = {'filter on item'}
                    onChange = {e => setNameFilter(e.target.value)}
                />
            </div>
        </div>,
        <DataTable
            columns={columns}
            key = 'crafts-table'
            data={data}
            sortBy = {'profit'}
            autoResetSortBy = {false}
        />
    ];
};

export default Crafts;
