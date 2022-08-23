import { Link } from 'react-router-dom';

import { useItemsQuery } from '../../features/items/queries';
import { useMetaQuery } from '../../features/meta/queries';

const ContainedItemsList = ({ item }) => {
    const { data: items } = useItemsQuery();
    const { data: meta } = useMetaQuery();

    //const containers = item.properties?.slots || item.properties?.grids;
    const containers = item.properties?.grids;
    if (
        !containers ||
        (containers.length === 1 &&
            containers[0].filters.allowedCategories.length === 1 &&
            containers[0].filters.allowedCategories[0] === '54009119af1c881c07000029')
    ) {
        return null;
    }

    const sortedItems = items.filter(linkedItem => {
        for (const slot of containers) {
            /*const included = slot.filters.allowedItems.includes(linkedItem.id) ||
                linkedItem.categoryIds.some(catId => slot.filters.allowedCategories.includes(catId));
            const excluded = slot.filters.excludedItems.includes(linkedItem.id) ||
                linkedItem.categoryIds.some(catId => slot.filters.excludedCategories.includes(catId));*/
            const included = slot.filters.allowedItems.includes(linkedItem.id);
            const excluded = linkedItem.categoryIds.some(catId => slot.filters.excludedCategories.includes(catId));
            if (included && !excluded) return true;
        }
        return false;
    });

    meta.categories.forEach(category => {
        for (const slot of containers) {
            if (slot.filters.allowedCategories.includes(category.id)) {
                sortedItems.push(category);
            }
        }
    });
    
    sortedItems.sort((a,b) => {
        const textA = a.normalizedName;
        const textB = b.normalizedName;
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });

    return (
        <div>
            <span className="contained-item-title-wrapper">Can hold:</span>
            {sortedItems.map((linked, index) => {
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
                            {sortedItems.length > index + 1 ? ',' : ''}
                        </span>
                    </span>
                );
            })}
        </div>
    );
};

export default ContainedItemsList;
