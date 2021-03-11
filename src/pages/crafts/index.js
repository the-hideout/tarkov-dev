import {useMemo, useState, useRef, useEffect} from 'react';
import {Helmet} from 'react-helmet';
import Switch from 'react-switch';
import { useQuery } from 'use-http';

import DataTable from '../../components/data-table';
import formatPrice from '../../modules/format-price';
import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage'
import fleaMarketFee from '../../modules/flea-market-fee';

import Items from '../../Items';

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

const fuelIds = [
    '5d1b371186f774253763a656', // Expeditionary fuel tank
    '5d1b36a186f7742523398433', // Metal fuel tank
];

function priceCell({ value }) {
    return <div
        className = 'center-content'
    >
        {formatPrice(value)}
    </div>;
};

function profitCell({ value }) {
    return <div
        className = {`center-content ${value > 0 ? 'craft-profit' : 'craft-loss'}`}
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
    const [freeFuel, setFreeFuel] = useState(false);
    const [selectedStation, setSelectedStation] = useStateWithLocalStorage('selectedStation', 'top');

    const [crafts, setCrafts] = useState([]);
	const { query } = useQuery`
    {
        crafts {
          rewardItems {
            item {
              id
              name
              iconLink
              imageLink
              wikiLink
              avg24hPrice
            }
            count
          }
          requiredItems {
            item {
              id
              name
              iconLink
              imageLink
              wikiLink
              avg24hPrice
            }
            count
          }
          source
          duration
        }
    }
	`;

	// aka componentDidMount
	const mounted = useRef(false);

	useEffect(() => {
		if (mounted.current) {
            return;
        }

		mounted.current = true;
		initializeCrafts();
	});

	async function initializeCrafts() {
        let crafts = [];
        try {
            const res = await query();
            if (res.data && res.data.crafts) {
                crafts = res.data.crafts;
            }
        } catch (loadError){
            console.error(loadError);
        }

		if (crafts.length > 0) {
            setCrafts(crafts);
        }
	}

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
                accessor: 'profit',
                Cell: profitCell,
                sortType: 'basic',
            },
            {
                Header: 'Estimated profit per hour',
                accessor: 'profitPerHour',
                Cell: profitCell,
                sortType: 'basic',
            },
        ],
        []
    )

    const data = useMemo(() => {
        let addedStations = [];

        return crafts.map((craftRow) => {
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

            if(!nameFilter && selectedStation && selectedStation !== 'top' && selectedStation !== station.toLowerCase().replace(/\s/g, '-')){
                return false;
            }

            const tradeData = {
                costItems: craftRow.requiredItems.map(requiredItem => {
                        let calculationPrice = requiredItem.item.avg24hPrice;
                        if(requiredItem.item.avg24hPrice * requiredItem.count === 0){
                            console.log(`Found a zero cost item! ${requiredItem.item.name}`);

                            hasZeroCostItem = true;
                        }

                        if(freeFuel && fuelIds.includes(requiredItem.item.id)){
                            calculationPrice = 0;
                        }

                        totalCost = totalCost + calculationPrice * requiredItem.count;

                        return {
                            count: requiredItem.count,
                            name: requiredItem.item.name,
                            price: calculationPrice,
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
            };

            tradeData.profit = Math.floor((craftRow.rewardItems[0].item.avg24hPrice * craftRow.rewardItems[0].count) - totalCost -  fleaMarketFee(Items[craftRow.rewardItems[0].item.id].basePrice, craftRow.rewardItems[0].item.avg24hPrice, craftRow.count));
            tradeData.profitPerHour = Math.floor(tradeData.profit / (craftRow.duration / 3600));

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
        })
        .filter((craft) => {
            // This is done after profit sorting
            if(selectedStation !== 'top'){
                return true;
            }

            if(addedStations.includes(craft.reward.source)){
                return false;
            }

            addedStations.push(craft.reward.source);

            return true;
        });
    },
        [nameFilter, selectedStation, freeFuel, crafts]
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
            <label
                className = {'filter-toggle-wrapper'}
            >
                <div
                    className = {'filter-toggle-label'}
                >
                    Fuel is free
                </div>
                <Switch
                    className = {'filter-toggle'}
                    onChange = {e => setFreeFuel(!freeFuel)}
                    checked = {freeFuel}
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
            columns = {columns}
            key = 'crafts-table'
            data = {data}
            sortBy = {'profit'}
            sortByDesc = {true}
            autoResetSortBy = {false}
        />
    ];
};

export default Crafts;
