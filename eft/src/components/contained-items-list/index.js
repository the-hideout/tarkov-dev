import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import useMetaData from '../../features/meta/index.js';
import useItemsData from '../../features/items/index.js';

import './index.css';

const ContainedItemsList = ({ item, showRestrictedType }) => {
    const { data: meta, status: metaStatus } = useMetaData();
    const { data: items } = useItemsData();
    const { t } = useTranslation();

    //const containers = item.properties?.slots || item.properties?.grids;
    const containers = item.properties?.grids;
    const holdItems = useMemo(() => {
        if (!items) {
            return [];
        }
        
        if (showRestrictedType) {
            const restrictedItems = new Set();
            item.properties?.grids?.forEach(grid => {
                for (const id of grid.filters.excludedItems) {
                    restrictedItems.add(id)
                }
            });
            return [...restrictedItems].map(id => {
                const rItem = items.find(testItem => testItem.id === id);
                if (!rItem) {
                    return false;
                }
                if (rItem.types.includes(showRestrictedType)) {
                    return rItem;
                }
                return false;
            }).filter(Boolean).sort((a, b) => {
                return a.name.localeCompare(b.name);
            });
        }
        else {
            if (!containers ||
                (containers.length === 1 &&
                    containers[0].filters.allowedCategories.length === 1 &&
                    containers[0].filters.allowedCategories[0] === '54009119af1c881c07000029')) {
                return [];
            }
            let sorted = items.filter(linkedItem => {
                for (const slot of containers) {
                    // const included = slot.filters.allowedItems.includes(linkedItem.id) || linkedItem.categoryIds.some(catId => slot.filters.allowedCategories.includes(catId));
                    // const excluded = slot.filters.excludedItems.includes(linkedItem.id) || linkedItem.categoryIds.some(catId => slot.filters.excludedCategories.includes(catId));
                    const included = slot.filters.allowedItems.includes(linkedItem.id);
                    const excluded = linkedItem.categoryIds.some(catId => slot.filters.excludedCategories.includes(catId));
                    if (included && !excluded) 
                        return true;
                }
                return false;
            });
    
            if (metaStatus !== 'idle') {
                meta.categories.forEach(category => {
                    for (const slot of containers) {
                        if (slot.filters.allowedCategories.includes(category.id)) {
                            sorted.push(category);
                        }
                    }
                });
            }
    
            return sorted.reduce((allItems, current) => {
                if (!allItems.some(item => item.id === current.id))
                    allItems.push(current);
                return allItems;
            }, []).sort((a, b) => {
                return a.name.localeCompare(b.name);
            });
        }
    }, [
        items,
        meta,
        metaStatus,
        containers,
        item,
        showRestrictedType
    ]);
    //console.log(item.name, item.showRestricted, sortedItems)

    let itemsText = t('Can hold:');
    if (showRestrictedType) {
        itemsText = t('Can\'t hold:');
    }

    if (holdItems.length === 0) {
        return null;
    }
    if (holdItems.length === 1 && holdItems[0].id === '54009119af1c881c07000029') {
        return null;
    }

    return (
        <div>
            <span className="contained-item-title-wrapper">{itemsText}</span>
            {holdItems.map((linked, index) => {
                if (linked.id === '54009119af1c881c07000029') {
                    // Special case for items that can contain all items

                    return null;
                }
                const isCategory = linked.parent ? 's' : '';

                return (
                    <span
                        className="contained-item-link-wrapper"
                        key={`item-link-${item.id}-${linked.id}`}
                    >
                        <Link
                            className="contained-item-link"
                            to={`/item${isCategory}/${linked.normalizedName}`}
                        >
                            {linked.name}
                        </Link>
                        <span>
                            {holdItems.length > index + 1 ? ',' : ''}
                        </span>
                    </span>
                );
            })}
        </div>
    );
};

export default ContainedItemsList;
