import { Link } from 'react-router-dom';

import formatCategoryName from '../../modules/format-category-name';

import categoryData from '../../data/category-data.json';
import { useItemsQuery } from '../../features/items/queries';

const ContainedItemsList = ({ item }) => {
    const { data: items } = useItemsQuery();

    if (
        !item.canHoldItems ||
        (item.canHoldItems.length === 1 &&
            item.canHoldItems[0] === '54009119af1c881c07000029')
    ) {
        return null;
    }

    const sortedItems = [...item.canHoldItems];

    sortedItems.sort((a, b) => {
        const firstCategory = categoryData[a];
        const secondCategory = categoryData[b];

        let firstTitle = firstCategory?.urlName;
        let secondTitle = secondCategory?.urlName;

        if (!firstCategory) {
            const firstItem = items.find((item) => item.id === a);

            firstTitle = firstItem?.normalizedName;
        }

        if (!secondCategory) {
            const secondItem = items.find((item) => item.id === b);

            secondTitle = secondItem?.normalizedName;
        }

        if (!firstTitle || !secondTitle) {
            return 0;
        }

        return firstTitle.localeCompare(secondTitle);
    });

    return (
        <div>
            <span className="contained-item-title-wrapper">Can hold:</span>
            {sortedItems.map((itemOrCategoryId, index) => {
                const currentCategoryData = categoryData[itemOrCategoryId];
                let linkedItem = false;

                if (itemOrCategoryId === '54009119af1c881c07000029') {
                    // Special case for items that can contain all items

                    return null;
                }

                if (!currentCategoryData) {
                    linkedItem = items.find(
                        (item) => item.id === itemOrCategoryId,
                    );
                }

                if (!linkedItem && !currentCategoryData) {
                    console.log(itemOrCategoryId);

                    return null;
                }

                if (linkedItem && linkedItem.types.includes('disabled')) {
                    return null;
                }

                return (
                    <span
                        className="contained-item-link-wrapper"
                        key={`item-link-${item.id}-${
                            linkedItem?.id || currentCategoryData._id
                        }`}
                    >
                        <Link
                            className="contained-item-link"
                            to={
                                currentCategoryData
                                    ? `/items/${currentCategoryData?.urlName}`
                                    : `/item/${linkedItem.normalizedName}`
                            }
                        >
                            {currentCategoryData
                                ? formatCategoryName(currentCategoryData)
                                : linkedItem.name}
                        </Link>
                        {item.canHoldItems.length > index + 1 ? ',' : ''}
                    </span>
                );
            })}
        </div>
    );
};

export default ContainedItemsList;
