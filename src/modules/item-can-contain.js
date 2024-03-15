export default function itemCanContain(item, containedItem, containerType = false) {
    let container = item.properties?.slots || item.properties?.grids;
    if (containerType && item.properties) container = item.properties[containerType];
    if (!container) return false;
    for (const slot of container) {
        const included = slot.filters.allowedItems.includes(containedItem.id) ||
            containedItem.categoryIds.some(catId => slot.filters.allowedCategories.includes(catId));
        const excluded = slot.filters.excludedItems.includes(containedItem.id) ||
            containedItem.categoryIds.some(catId => slot.filters.excludedCategories.includes(catId));
        if (included && !excluded) return true;
    }
    return false;
};
