import {useMemo} from 'react';
import {Helmet} from 'react-helmet';

import Menu from '../components/menu';
import DataTable from '../components/data-table';
import formatPrice from '../modules/format-price';
import items from '../Items';

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

function Armor() {
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
            },
            {
                Header: 'Armor Class',
                accessor: 'armorClass',
                Cell: centerCell,
            },
            {
                Header: 'Material',
                accessor: 'material',
                Cell: centerCell,
            },
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
                Header: 'Movement Speed',
                accessor: 'movement',
                Cell: centerCell,
            },
            {
                Header: 'Turn Speed',
                accessor: 'turnSpeed',
                Cell: centerCell,
            },
            {
                Header: 'Ergonomics',
                accessor: 'ergonomics',
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
        return {
            name: item.name,
            armorClass: item.itemProperties.armorClass,
            material: item.itemProperties.ArmorMaterial,
            maxDurability: item.itemProperties.MaxDurability,
            repairability: `${materialRepairabilityMap[item.itemProperties.ArmorMaterial]}/6`,
            effectiveDurability: Math.floor(item.itemProperties.MaxDurability / materialDestructabilityMap[item.itemProperties.ArmorMaterial]),
            movement: `${item.itemProperties.speedPenaltyPercent}%`,
            turnSpeed: `${item.itemProperties.mousePenalty}%`,
            ergonomics: `${item.itemProperties.weaponErgonomicPenalty}%`,
            price: formatPrice(item.price),
            image: item.imgLink,
        };
    })
    .filter(Boolean)
    .sort((itemA, itemB) => {
        return itemB.blindness - itemA.blindness;
    }), [])

    return [<Helmet>
        <meta
            charSet='utf-8'
        />
        <title>
            Escape from Tarkov item tracker
        </title>
        <meta
            name = 'description'
            content = 'Track what items you need to Find in Raid for Escape from Tarkov quests'
        />
    </Helmet>,
    <Menu />,
    <div
        className="display-wrapper"
        key = {'display-wrapper'}
    >
        <DataTable
            columns={columns}
            data={data}
        />
    </div>
    ];
};

export default Armor;
