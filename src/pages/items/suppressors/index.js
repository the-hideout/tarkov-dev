import { useMemo, useState, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

import Icon from '@mdi/react';
import {mdiBottleWine} from '@mdi/js';

import ItemsTable from '../../../components/item-table';
import { Filter, SelectFilter } from '../../../components/filter';
import { useItemsQuery } from '../../../features/items/queries';
import itemCanContain from '../../../modules/item-can-contain';

const getGuns = (items, targetItem) => {
    let parentItems = [];
    const currentParentItems = items.filter((innerItem) =>
        itemCanContain(innerItem, targetItem, 'slots'),
    );

    for (const parentItem of currentParentItems) {
        if (parentItem.types.includes('gun')) {
            parentItems.push(parentItem);

            continue;
        }

        parentItems = parentItems.concat(getGuns(items, parentItem));
    }

    let idCache = [];

    parentItems = parentItems
        .map((parentItem) => {
            if (idCache.includes(parentItem.id)) {
                return false;
            }

            idCache.push(parentItem.id);

            return parentItem;
        })
        .filter(Boolean);

    return parentItems;
};

const getAttachmentPoints = (items, targetItem) => {
    return items
        .filter((innerItem) => itemCanContain(innerItem, targetItem, 'slots'))
        .map((item) => {
            return {
                ...item,
                fitsTo: getGuns(items, item),
            };
        });
};

function Suppressors(props) {
    const [selectedGun, setSelectedGun] = useState(false);
    const { data: items } = useItemsQuery();

    const selectInputRef = useRef(null);
    const { t } = useTranslation();

    const allItems = useMemo(
        () =>
            items
                .filter((item) => item.types.includes('suppressor'))
                .map((item) => {
                    return {
                        ...item,
                        fitsTo: getGuns(items, item),
                        subRows: getAttachmentPoints(items, item),
                    };
                }),

        [items],
    );

    const activeGuns = useMemo(() => {
        let activeGuns = [];
        let idCache = [];

        allItems.map((displayItem) => {
            for (const subRow of displayItem.fitsTo) {
                if (idCache.includes(subRow.id)) {
                    continue;
                }

                idCache.push(subRow.id);

                activeGuns.push(subRow);
            }

            return true;
        });

        activeGuns.sort((a, b) => a.name.localeCompare(b.name));

        return activeGuns;
    }, [allItems]);

    const displayItems = useMemo(
        () =>
            allItems
                .filter((item) => {
                    if (!selectedGun) {
                        return true;
                    }

                    for (const subRow of item.fitsTo) {
                        if (subRow.id === selectedGun.id) {
                            return true;
                        }
                    }

                    return false;
                })
                .map((subItem) => {
                    subItem.subRows = subItem.subRows.filter((item) => {
                        if (!selectedGun) {
                            return true;
                        }

                        for (const subRow of item.fitsTo) {
                            if (subRow.id === selectedGun.id) {
                                return true;
                            }
                        }

                        return false;
                    });

                    return subItem;
                })
                .map(subItem => {
                    subItem.recoil = Math.round(subItem.properties.recoilModifier*100)+'%';
                    return subItem;
                }),
        [allItems, selectedGun],
    );

    const columns = [
        {
            key: 'iconLink',
            type: 'image',
        },
        {
            title: t('Name'),
            key: 'name',
            type: 'name',
        },
        {
            title: t('Ergonomics'),
            key: 'properties.ergonomics',
        },
        {
            title: t('Recoil'),
            key: 'recoil',
        },
        {
            title: t('Cost'),
            key: 'avg24hPrice',
            type: 'price',
        },
    ];

    return [
        <Helmet key={'suppressors-table'}>
            <meta charSet="utf-8" />
            <title>{t('Escape from Tarkov')} - {t('Suppressors')}</title>
            <meta
                name="description"
                content="All suppressors in Escape from Tarkov sortable by price, caliber etc"
            />
        </Helmet>,
        <div className="display-wrapper" key={'display-wrapper'}>
            <div className="page-headline-wrapper">
                <h1>
                    {t('Escape from Tarkov')}
                    <Icon path={mdiBottleWine} size={1.5} className="icon-with-text" /> 
                    {t('Suppressors')}
                </h1>
                <Filter center>
                    <SelectFilter
                        label={t('Filter by gun')}
                        options={activeGuns.map((activeGun) => {
                            return {
                                label: activeGun.name,
                                value: activeGun.id,
                            };
                        })}
                        onChange={(event) => {
                            if (!event) {
                                return true;
                            }

                            setSelectedGun(
                                activeGuns.find(
                                    (activeGun) => activeGun.id === event.value,
                                ),
                            );
                        }}
                        parentRef={selectInputRef}
                        wide
                    />
                    {selectedGun && (
                        <img
                            alt={`${selectedGun.name}-icon`}
                            onClick={() => {
                                selectInputRef.current?.clearValue();
                                setSelectedGun(false);
                            }}
                            loading="lazy"
                            src={selectedGun.iconLink}
                        />
                    )}
                </Filter>
            </div>

            <ItemsTable 
                columns={columns} 
                items={displayItems} 
            />

            <div className="page-wrapper items-page-wrapper">
                <p>
                    {"In Escape from Tarkov, a suppressor is a muzzle device (a functional mod) and can be installed on a weapon to muffle gunshot sound."}
                </p>
            </div>
        </div>,
    ];
}

export default Suppressors;
