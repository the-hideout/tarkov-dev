import {useMemo} from 'react';
import {Helmet} from 'react-helmet';
import Switch from 'react-switch';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import DataTable from '../../components/data-table';
import formatPrice from '../../modules/format-price';
import items from '../../Items';
import ID from '../../components/ID.jsx';
import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage';

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
}

let displayItems = [];

for(const item of Object.values(items)){
    if(!item.types.includes('armor')){
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

const getArmorZoneString = (armorZones) => {
    return armorZones.map((zoneName) => {
        if(zoneName === 'Chest'){
            return 'Thorax';
        }

        if(zoneName === 'LeftArm'){
            return false;
        }

        if(zoneName === 'RightArm'){
            return 'Arms';
        }

        return zoneName;
    })
    .filter(Boolean)
    .join(', ');
};

const marks = {
    1: 6,
    2: 5,
    3: 4,
    4: 3,
    5: 2,
    6: 1,
};

function Armor(props) {
    const [includeRigs, setIncludeRigs] = useStateWithLocalStorage('includeRigs', true);
    const [minArmorClass, setMinArmorClass] = useStateWithLocalStorage('minArmorClass', 6);
    const [maxPrice, setMaxPrice] = useStateWithLocalStorage('armorMaxPrice', 9999999);

    const columns = useMemo(
        () => [
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
            // {
            //     Header: 'Material',
            //     accessor: 'material',
            //     Cell: centerCell,
            // },
            {
                Header: 'Max Durability',
                accessor: 'maxDurability',
                Cell: centerCell,
            },
            {
                Header: 'Effective Durability',
                accessor: 'effectiveDurability',
                Cell: centerCell,
            },
            {
                Header: 'Repairability',
                accessor: 'repairability',
                Cell: centerCell,
            },
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
        // console.log(item);
        if(!materialDestructabilityMap[item.itemProperties.ArmorMaterial]){
            console.log(`Missing ${item.itemProperties.ArmorMaterial}`);
        }

        if(!includeRigs && item.hasGrid){
            return false;
        }

        if(item.itemProperties.armorClass < (7 - minArmorClass)){
            return false;
        }

        if(item.price > maxPrice){
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
            armorZone: getArmorZoneString(item.itemProperties.armorZone),
            material: item.itemProperties.ArmorMaterial,
            maxDurability: item.itemProperties.MaxDurability,
            repairability: `${materialRepairabilityMap[item.itemProperties.ArmorMaterial]}/6`,
            effectiveDurability: Math.floor(item.itemProperties.MaxDurability / materialDestructabilityMap[item.itemProperties.ArmorMaterial]),
            stats: `${item.itemProperties.speedPenaltyPercent}% / ${item.itemProperties.mousePenalty}% / ${item.itemProperties.weaponErgonomicPenalty}`,
            price: formatPrice(item.price),
            image: `https://assets.tarkov-tools.com/${item.id}-grid-image.jpg`,
            wikiLink: item.wikiLink,
        };
    })
    .filter(Boolean)
    .sort((itemA, itemB) => {
        return itemB.blindness - itemA.blindness;
    }), [includeRigs, minArmorClass, maxPrice]);

    const handleArmorClassChange = (newValueLabel) => {
        setMinArmorClass(newValueLabel);
    };

    return [<Helmet
        key = {'armor-table'}
    >
        <meta
            charSet='utf-8'
        />
        <title>
            Escape from Tarkov Armor chart
        </title>
        <meta
            name = 'description'
            content = 'All armor in Escape from Tarkov sortable by price, repairability, armor class etc'
        />
    </Helmet>,
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
                    Include rigs
                </div>
                <Switch
                    className = {'filter-toggle'}
                    onChange = {e => setIncludeRigs(!includeRigs)}
                    checked = {includeRigs}
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
            <div
                className = 'filter-input-wrapper'
            >
                <div
                    className = 'filter-input-label'
                >
                    Max price
                </div>
                <input
                    defaultValue = {maxPrice || ''}
                    type = {'number'}
                    placeholder = {'max price'}
                    onChange = {e => setMaxPrice(Number(e.target.value))}
                />
            </div>
        </div>
        <DataTable
            columns = {columns}
            data = {data}
            sortBy = {'effectiveDurability'}
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

export default Armor;
