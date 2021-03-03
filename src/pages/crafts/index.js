import {useMemo, useState} from 'react';
import {Helmet} from 'react-helmet';

import DataTable from '../../components/data-table';
import formatPrice from '../../modules/format-price';
import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage'
import fleaMarketFee from '../../modules/flea-market-fee';

import Items from '../../Items';
import rawData from '../../data/crafts.json';

import './index.css';

const stations = [
    'booze-generator',
    'intelligence-center',
    'lavatory',
    'medstation',
    'nutrition-unit',
    'water-collector',
    'workbench',
];

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
                ><img
                        alt = {costItem.name}
                        loading = 'lazy'
                        src = {costItem.iconLink}
                    /></div>
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
    const [selectedStation, setSelectedStation] = useStateWithLocalStorage('selectedStation', 'top');

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
                        ><span
                            className = 'craft-reward-count-wrapper'
                        >
                            {value.count}
                        </span><img
                                alt = ''
                                className = 'table-image'
                                loading = 'lazy'
                                src = { value.iconLink }
                            /></div>
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
            let [station, ] = craftRow.source.split('level');

            station = station.trim();

            if(selectedStation && selectedStation !== 'top' && selectedStation !== station.toLowerCase().replace(/\s/g, '-')){
                return false;
            }

            const tradeData = {
                costItems: craftRow.requiredItems.map(requiredItem => {
                        totalCost = totalCost + requiredItem.item.avg24hPrice * requiredItem.count;

                        if(requiredItem.item.avg24hPrice * requiredItem.count === 0){
                            console.log(`Found a zero cost item! ${requiredItem.item.name}`);

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
                    count: craftRow.rewardItems[0].count,
                },
                profit: (craftRow.rewardItems[0].item.avg24hPrice * craftRow.rewardItems[0].count) - totalCost -  fleaMarketFee(Items[craftRow.rewardItems[0].item.id].basePrice, craftRow.rewardItems[0].item.avg24hPrice, craftRow.count),
            };

            // If the reward has no value, it's not available for purchase
            if(tradeData.reward.value === 0){
                tradeData.reward.value = tradeData.cost;
                tradeData.reward.barterOnly = true;
                tradeData.profit = 0;
            }

            if(hasZeroCostItem){
                // console.log('Found a zero cost item!');
                // console.log(craftRow);

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
        });
    },
        [nameFilter, selectedStation]
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
            <div className = 'button-group-wrapper'>
                {stations.map((stationName) => {
                    return <button
                        className = {`button-group-button ${stationName === selectedStation ? 'selected': ''}`}
                        key = {`station-selector-button-${stationName}`}
                        onClick={setSelectedStation.bind(undefined, stationName)}
                    ><img
                            alt = {stationName}
                            title = {stationName}
                            src={`${process.env.PUBLIC_URL}/images/${stationName}-icon.png`}
                        /></button>
                })}
                <button
                    className = {`button-group-button ${'top' === selectedStation ? 'selected': ''}`}
                    title = 'Top crafts in each station'
                    onClick={setSelectedStation.bind(undefined, 'top')}
                >
                    Top
                </button>
            </div>
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
