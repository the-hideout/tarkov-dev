import {
    Link,
} from "react-router-dom";
import {
    useSelector
} from 'react-redux';

import { selectAllItems } from "../../features/items/itemsSlice";
import formatCategoryName from '../../modules/format-category-name';

import categoryData from '../../data/category-data.json';

const ContainedItemsList = ({item}) => {
    const items = useSelector(selectAllItems);

    if(!item.canHoldItems){
        return null;
    }

    return <div>
        <span
            className='contained-item-title-wrapper'
        >
            Can hold:
        </span>
        {item.canHoldItems.map((itemOrCategoryId, index) => {
            const currentCategoryData = categoryData[itemOrCategoryId];
            let linkedItem = false;

            if(itemOrCategoryId === '54009119af1c881c07000029'){
                // Special case for items that can contain all items

                return null;
            }

            if(!currentCategoryData){
                linkedItem = items.find(item => item.id === itemOrCategoryId);
            }

            if(!linkedItem && !currentCategoryData){
                console.log(itemOrCategoryId);

                return null;
            }

            if(linkedItem && linkedItem.types.includes('disabled')){
                return null;
            }

            return <span
                className='contained-item-link-wrapper'
                key = {`item-link-${item.id}-${linkedItem?.id || currentCategoryData._id}`}
            >
                <Link
                    className="contained-item-link"
                    to={currentCategoryData ? `/items/${currentCategoryData?.urlName}` : `/item/${linkedItem.normalizedName}`}
                >
                    {currentCategoryData ? formatCategoryName(currentCategoryData) : linkedItem.name}
                </Link>
                {item.canHoldItems.length > index + 1 ? ',' : ''}
            </span>
        })}
    </div>
};

export default ContainedItemsList;