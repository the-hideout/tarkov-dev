import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

import CanvasGrid from '../../../components/canvas-grid';
import DataTable from '../../../components/data-table';
import ValueCell from '../../../components/value-cell';
import { Filter, ToggleFilter, SliderFilter } from '../../../components/filter';
import CenterCell from '../../../components/center-cell';
import useStateWithLocalStorage from '../../../hooks/useStateWithLocalStorage';
import { useItemsQuery } from '../../../features/items/queries';

const marks = {
    0: 25,
    5: 20,
    10: 15,
    15: 10,
    20: 5,
    25: 0,
};

function Backpacks(props) {
    const { data: items } = useItemsQuery();

    const [includeArmoredRigs, setIncludeArmoredRigs] =
        useStateWithLocalStorage('includeArmoredRigs', true);
    const [minSlots, setMinSlots] = useStateWithLocalStorage('minSlots', 0);
    const [has3Slot, setHas3Slot] = useState(false);
    const [has4Slot, setHas4Slot] = useState(false);
    const { t } = useTranslation();

    const displayItems = useMemo(
        () => items.filter((item) => item.types.includes('rig')),
        [items],
    );

    let maxSlots = Math.max(
        ...displayItems.map(
            (displayItem) => displayItem.itemProperties.grid?.totalSize || 0,
        ),
    );
    if (maxSlots === Infinity) {
        maxSlots = 1;
    }

    const handleMinSlotsChange = (newValueLabel) => {
        setMinSlots(maxSlots - newValueLabel);
    };

    const columns = useMemo(
        () => [
            {
                accessor: 'image',
                Cell: ({ value }) => {
                    return (
                        <div className="center-content">
                            <img
                                alt=""
                                className="table-image"
                                height="64"
                                loading="lazy"
                                src={value}
                                width="64"
                            />
                        </div>
                    );
                },
            },
            {
                Header: t('Grid'),
                accessor: 'grid',
                Cell: ({ value }) => {
                    return (
                        <div>
                            <CanvasGrid
                                height={value.height}
                                grid={value.pockets}
                                width={value.width}
                            />
                        </div>
                    );
                },
            },
            {
                Header: t('Name'),
                accessor: 'name',
                Cell: (cellData) => {
                    const fullItemData = cellData.data.find(
                        (cellItem) => cellItem.name === cellData.value,
                    );
                    return (
                        <div className="center-content">
                            <a href={fullItemData.itemLink}>{cellData.value}</a>
                            {fullItemData.notes ? (
                                <cite>{fullItemData.notes}</cite>
                            ) : (
                                ''
                            )}
                        </div>
                    );
                },
            },
            {
                Header: t('Grid slots'),
                accessor: 'slots',
                Cell: CenterCell,
            },
            {
                Header: t('Inner size'),
                accessor: 'size',
                Cell: CenterCell,
            },
            {
                Header: t('Weight'),
                accessor: 'weight',
                Cell: ({ value }) => {
                    return <CenterCell value={value} nowrap />;
                },
            },
            {
                Header: t('Slot ratio'),
                accessor: 'ratio',
                Cell: CenterCell,
            },
            {
                Header: t('Price'),
                accessor: 'price',
                Cell: ValueCell,
            },
            {
                Header: t('Price per slot'),
                accessor: 'pricePerSlot',
                Cell: ValueCell,
            },
        ],
        [t],
    );

    const data = useMemo(
        () =>
            displayItems
                .map((item) => {
                    const match = item.name.match(/(.*)\s\(\d.+?$/);
                    let itemName = item.name;

                    if (match) {
                        itemName = match[1].trim();
                    }

                    if (!includeArmoredRigs && item.types.includes('armor')) {
                        return false;
                    }

                    if (item.itemProperties.grid?.totalSize < minSlots) {
                        return false;
                    }

                    if (has3Slot) {
                        const isValid = item.grid?.pockets?.find((pocket) => {
                            return pocket.width === 1 && pocket.height === 3;
                        });

                        if (!isValid) {
                            return false;
                        }
                    }

                    if (has4Slot) {
                        const isValid = item.grid?.pockets?.find((pocket) => {
                            return pocket.width === 2 && pocket.height === 2;
                        });

                        if (!isValid) {
                            return false;
                        }
                    }

                    return {
                        grid: item.grid,
                        id: item.id,
                        image:
                            item.iconLink ||
                            'https://tarkov.dev/images/unknown-item-icon.jpg',
                        name: itemName,
                        price: item.avg24hPrice,
                        pricePerSlot: Math.floor(item.avg24hPrice / item.slots),
                        ratio: (
                            item.itemProperties.grid?.totalSize / item.slots
                        ).toFixed(2),
                        size: item.itemProperties.grid?.totalSize,
                        slots: item.slots,
                        weight: `${item.itemProperties.Weight} kg`,
                        wikiLink: item.wikiLink,
                        itemLink: `/item/${item.normalizedName}`,
                        notes: item.notes,
                    };
                })
                .filter(Boolean),
        [displayItems, includeArmoredRigs, minSlots, has3Slot, has4Slot],
    );

    return [
        <Helmet key={'backpacks-table'}>
            <meta charSet="utf-8" />
            <title>{t('Escape from Tarkov Rigs')}</title>
            <meta
                name="description"
                content="All backpacks in Escape from Tarkov sortable by price, size etc"
            />
        </Helmet>,
        <div className="display-wrapper" key={'display-wrapper'}>
            <div className="page-headline-wrapper">
                <h1>{t('Escape from Tarkov Rigs')}</h1>
                <Filter center>
                    <ToggleFilter
                        label={t('Armored rigs?')}
                        onChange={(e) =>
                            setIncludeArmoredRigs(!includeArmoredRigs)
                        }
                        checked={includeArmoredRigs}
                    />
                    <SliderFilter
                        defaultValue={25 - minSlots}
                        label={t('Min. slots')}
                        min={0}
                        max={25}
                        marks={marks}
                        reverse
                        onChange={handleMinSlotsChange}
                    />
                    <ToggleFilter
                        label={t('3-slot')}
                        onChange={(e) => setHas3Slot(!has3Slot)}
                        checked={has3Slot}
                    />
                    <ToggleFilter
                        label={t('4-slot')}
                        onChange={(e) => setHas4Slot(!has4Slot)}
                        checked={has4Slot}
                    />
                </Filter>
            </div>
            <DataTable
                columns={columns}
                data={data}
                sortBy={'slots'}
                sortByDesc={true}
                autoResetSortBy={false}
            />
        </div>,
    ];
}

export default Backpacks;
