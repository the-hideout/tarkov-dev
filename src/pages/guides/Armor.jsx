import {useMemo} from 'react';
import {Helmet} from 'react-helmet';
import Switch from 'react-switch';

import Menu from '../../components/menu';
import DataTable from '../../components/data-table';
import formatPrice from '../../modules/format-price';
import items from '../../Items';
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

function Armor() {
    const [includeRigs, setIncludeRigs] = useStateWithLocalStorage('includeRigs', true);

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
                Cell: centerCell,
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
            image: item.imgLink,
            wikiLink: item.wikiLink,
        };
    })
    .filter(Boolean)
    .sort((itemA, itemB) => {
        return itemB.blindness - itemA.blindness;
    }), [includeRigs])

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
                    Include rigs
                </div>
                <Switch
                    className = {'filter-toggle'}
                    onChange = {e => setIncludeRigs(!includeRigs)}
                    checked = {includeRigs}
                />
            </label>
            </div>
        <DataTable
            columns={columns}
            data={data}
        />
    </div>
    ];
};

export default Armor;
