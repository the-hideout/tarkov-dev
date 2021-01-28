import {useMemo} from 'react';
import {Helmet} from 'react-helmet';
import Switch from 'react-switch';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import Menu from '../../components/menu';
import DataTable from '../../components/data-table';
import formatPrice from '../../modules/format-price';
import items from '../../Items';
import ID from '../../components/ID.jsx';
import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage';
import ArrowIcon from '../../components/data-table/Arrow.js';

const materialDestructabilityMap = {
    'Aramid': 0.25,
    'Combined': 0.5,
    'UHMWPE': 0.45,
    'Titan': 0.55,
    'Aluminium': 0.6,
    'ArmoredSteel': 0.7,
    'Ceramic': 0.8,
    'Glass': 0.8,
};

const materialRepairabilityMap = {
    'Aramid': 4,
    'Combined': 3,
    'UHMWPE': 6,
    'Titan': 4,
    'Aluminium': 4,
    'ArmoredSteel': 5,
    'Ceramic': 2,
    'Glass': 1,
};

const ricochetMap = (ricochetCoefficient) => {
    if(ricochetCoefficient < 0.2){
        return 'None';
    }

    if(ricochetCoefficient < 0.8){
        return 'Low';
    }

    if(ricochetCoefficient < 0.9){
        return 'Medium';
    }

    if(ricochetCoefficient < 1){
        return 'High';
    }
}

let displayItems = [];

for(const item of Object.values(items)){
    if(!item.types.includes('helmet')){
        continue;
    }

    displayItems.push(item);
}

const centerCell = ({ value }) => {
    return <div
        className = 'center-content'
    >
        { value }
    </div>
};

const centerNowrapCell = ({ value }) => {
    return <div
        className = 'center-content nowrap-content'
    >
        { value }
    </div>
};

const linkCell = (allData) => {
    return <a
        href = {allData.row.original.wikiLink}
    >
        {allData.value}
    </a>
};

const marks = {
    1: 6,
    2: 5,
    3: 4,
    4: 3,
    5: 2,
    6: 1,
};

const getStatsString = (itemProperties) => {
    if(!itemProperties.speedPenaltyPercent && !itemProperties.mousePenalty && !itemProperties.weaponErgonomicPenalty){
        return '';
    }

    return `${itemProperties.speedPenaltyPercent || 0}% / ${itemProperties.mousePenalty || 0}% / ${itemProperties.weaponErgonomicPenalty || 0}`
};

function Helmets(props) {
    const [includeBlockingHeadset, setIncludeBlockingHeadset] = useStateWithLocalStorage('includeBlockingHeadset', true);
    const [minArmorClass, setMinArmorClass] = useStateWithLocalStorage('minHelmetArmorClass', 6);
    const handleArmorClassChange = (newValueLabel) => {
        setMinArmorClass(newValueLabel);
    };
    const columns = useMemo(
        () => [
            {
                id: 'expander',
                Header: ({ getToggleAllRowsExpandedProps, isAllRowsExpanded }) => (
                    // <span {...getToggleAllRowsExpandedProps()}>
                    //     {isAllRowsExpanded ? 'v' : '>'}
                    // </span>
                    null
                ),
                Cell: ({ row }) =>
                    // Use the row.canExpand and row.getToggleRowExpandedProps prop getter
                    // to build the toggle for expanding a row
                    row.canExpand ? (
                        <span
                            {...row.getToggleRowExpandedProps({
                                style: {
                                    // We can even use the row.depth property
                                    // and paddingLeft to indicate the depth
                                    // of the row
                                    // paddingLeft: `${row.depth * 2}rem`,
                                },
                            })}
                        >
                            {row.isExpanded ? <ArrowIcon/> : <ArrowIcon className = {'arrow-right'} />}
                        </span>
                    ) : null,
            },
            {
                accessor: 'image',
                Cell: ({ value }) => {
                    return <div
                        className = 'center-content'
                    >
                        <img
                            alt = ''
                            className = 'table-image'
                            src = { value }
                        />
                    </div>
                },
            },
            {
                Header: 'Name',
                accessor: 'name',
                Cell: linkCell,
            },
            {
                Header: 'Armor Class',
                accessor: 'armorClass',
                Cell: centerCell,
            },
            {
                Header: 'Zones',
                accessor: 'armorZone',
                Cell: centerCell,
            },
            {
                Header: 'Ricochet chance',
                accessor: 'ricochetChance',
                Cell: centerCell,
            },
            {
                Header: 'Sound supression',
                accessor: 'deafenStrength',
                Cell: centerCell,
            },
            {
                Header: 'Blocks headphones',
                accessor: 'blocksHeadphones',
                Cell: centerCell,
            },
            {
                Header: 'Max Durability',
                accessor: 'maxDurability',
                Cell: centerCell,
            },
            // {
            //     Header: 'Effective Durability',
            //     accessor: 'effectiveDurability',
            //     Cell: centerCell,
            // },
            // {
            //     Header: 'Repairability',
            //     accessor: 'repairability',
            //     Cell: centerCell,
            // },
            {
                Header: ({ value }) => {
                    return <div
                        className = 'center-content'
                    >
                        Stats
                        <div>
                            Mov/Turn/Ergo
                        </div>
                    </div>
                },
                accessor: 'stats',
                Cell: centerNowrapCell,
            },
            {
                Header: 'Current Price',
                accessor: 'price',
                Cell: centerCell,
            },
        ],
        []
    )

    const data = useMemo(() => displayItems.map((item) => {
        if(!materialDestructabilityMap[item.itemProperties.ArmorMaterial]){
            console.log(`Missing ${item.itemProperties.ArmorMaterial}`);
        }

        if(item.itemProperties.armorClass < (7 - minArmorClass)){
            return false;
        }

        if(item.itemProperties.BlocksEarpiece && !includeBlockingHeadset){
            return false;
        }

        const match = item.name.match(/(.*)\s\(\d.+?$/);
        let itemName = item.name;

        if(match){
            itemName = match[1].trim();
        }

        return {
            name: itemName,
            armorClass: `${item.itemProperties.armorClass}/6`,
            armorZone: item.itemProperties.headSegments.join(', '),
            material: item.itemProperties.ArmorMaterial,
            deafenStrength: item.itemProperties.DeafStrength,
            blocksHeadphones: item.itemProperties.BlocksEarpiece ? 'Yes' : 'No',
            maxDurability: item.itemProperties.MaxDurability,
            ricochetChance: ricochetMap(item.itemProperties.RicochetParams.x),
            repairability: `${materialRepairabilityMap[item.itemProperties.ArmorMaterial]}/6`,
            effectiveDurability: Math.floor(item.itemProperties.MaxDurability / materialDestructabilityMap[item.itemProperties.ArmorMaterial]),
            stats: getStatsString(item.itemProperties),
            price: formatPrice(item.price),
            image: item.imgLink,
            wikiLink: item.wikiLink,
            subRows: item.linkedItems.map((linkedItemId) => {
                const linkedItem = items[linkedItemId];
                return {
                    name: linkedItem.name,
                    armorClass: linkedItem.itemProperties.armorClass ? `${linkedItem.itemProperties.armorClass}/6` : '',
                    armorZone: linkedItem.itemProperties.headSegments?.join(', '),
                    material: linkedItem.itemProperties.ArmorMaterial,
                    deafenStrength: linkedItem.itemProperties.DeafStrength,
                    blocksHeadphones: linkedItem.itemProperties.BlocksEarpiece ? 'Yes' : 'No',
                    maxDurability: linkedItem.itemProperties.MaxDurability,
                    ricochetChance: ricochetMap(linkedItem.itemProperties.RicochetParams?.x),
                    repairability: `${materialRepairabilityMap[linkedItem.itemProperties.ArmorMaterial]}/6`,
                    effectiveDurability: Math.floor(linkedItem.itemProperties.MaxDurability / materialDestructabilityMap[linkedItem.itemProperties.ArmorMaterial]),
                    stats: getStatsString(linkedItem.itemProperties),
                    price: formatPrice(linkedItem.price),
                    image: linkedItem.imgLink,
                    wikiLink: linkedItem.wikiLink,
                };
            }),
        }
    })
    .filter(Boolean)
    .sort((itemA, itemB) => {
        return itemB.blindness - itemA.blindness;
    }), [minArmorClass, includeBlockingHeadset])

    return [<Helmet
        key = {'helmet-table'}
    >
        <meta
            charSet='utf-8'
        />
        <title>
            Escape from Tarkov Helmet chart
        </title>
        <meta
            name = 'description'
            content = 'All helmets in Escape from Tarkov sortable by price, armor class etc'
        />
    </Helmet>,
    <Menu
        key = {'main-navigation'}
    />,
    <div
        className="display-wrapper data-wrapper"
        key = {'display-wrapper'}
    >
        <div
            className = 'data-table-filters-wrapper'
        >
            <label
                className = {'filter-toggle-wrapper'}
            >
                <div
                    className = {'filter-toggle-label'}
                >
                    Show blocking headset
                </div>
                <Switch
                    className = {'filter-toggle'}
                    onChange = {e => setIncludeBlockingHeadset(!includeBlockingHeadset)}
                    checked = {includeBlockingHeadset}
                />
            </label>
            <div
                className = {'filter-slider-wrapper'}
            >
                <div
                    className = {'filter-slider-label'}
                >
                    Min armor class
                </div>
                <Slider
                    defaultValue = {minArmorClass}
                    min = {1}
                    max = {6}
                    marks = {marks}
                    onChange = {handleArmorClassChange}
                    trackStyle = {{
                        backgroundColor: '#048802',
                    }}
                    handleStyle = {{
                        backgroundColor: '#048802',
                        borderColor: '#048802',
                    }}
                    activeDotStyle = {{
                        backgroundColor: '#048802',
                        borderColor: '#048802',
                    }}
                    reverse
                    style = {{
                        top: '-7px',
                        width: '170px',
                    }}
                />
            </div>
        </div>
        <DataTable
            columns={columns}
            data={data}
            sortBy = {'armorClass'}
            sortByDesc = {true}
            autoResetSortBy = {false}
        />
    </div>,
    <ID
        key = {'session-id'}
        sessionID = {props.sessionID}
    />
    ];
};

export default Helmets;
