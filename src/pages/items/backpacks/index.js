import { useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

import Icon from '@mdi/react';
import {mdiBagPersonal} from '@mdi/js';

import CanvasGrid from '../../../components/canvas-grid';
import DataTable from '../../../components/data-table';
import ValueCell from '../../../components/value-cell';
import { useItemsWithTypeQuery } from '../../../features/items/queries';

const centerCell = ({ value }) => {
    return <div className="center-content">{value}</div>;
};

const centerNowrapCell = ({ value }) => {
    return <div className="center-content nowrap-content">{value}</div>;
};

function Backpacks(props) {
    const { data: displayItems } = useItemsWithTypeQuery('backpack');

    const { t } = useTranslation();

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
                Cell: centerCell,
            },
            {
                Header: t('Inner size'),
                accessor: 'size',
                Cell: centerCell,
            },
            {
                Header: t('Weight'),
                accessor: 'weight',
                Cell: centerNowrapCell,
            },
            {
                Header: t('Slot ratio'),
                accessor: 'ratio',
                Cell: centerCell,
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

                    return {
                        grid: item.grid,
                        id: item.id,
                        image:
                            item.iconLink ||
                            'https://tarkov.dev/images/unknown-item-icon.jpg',
                        name: itemName,
                        price: item.avg24hPrice,
                        pricePerSlot: Math.floor(item.avg24hPrice / (item.itemProperties.grid?.totalSize - item.slots)),
                        ratio: (
                            item.itemProperties.grid?.totalSize / item.slots
                        ).toFixed(2),
                        size: item.itemProperties.grid?.totalSize,
                        slots: item.slots,
                        weight: `${parseFloat(item.itemProperties.Weight).toFixed(2)} kg`,
                        wikiLink: item.wikiLink,
                        itemLink: `/item/${item.normalizedName}`,
                        notes: item.notes,
                    };
                })
                .filter(Boolean),
        [displayItems],
    );

    return [
        <Helmet key={'backpacks-table'}>
            <meta charSet="utf-8" />
            <title>{t('Escape from Tarkov')} - {t('Backpacks Chart')}</title>
            <meta
                name="description"
                content="All backpacks in Escape from Tarkov sortable by price, size etc"
            />
        </Helmet>,
        <div className="display-wrapper" key={'display-wrapper'}>
            <div className="page-headline-wrapper">
                <h1>
                    {t('Escape from Tarkov')}
                    <Icon path={mdiBagPersonal} size={1.5} className="icon-with-text" /> 
                    {t('Backpacks Chart')}
                </h1>
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
