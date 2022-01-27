import {
    Link,
} from "react-router-dom";
import {
    useSelector
} from 'react-redux';

import { selectAllItems } from "../../features/items/itemsSlice";
import formatCategoryName from '../../modules/format-category-name';

import categoryData from '../../data/category-data.json';
import './index.css';

const ItemLinks = ({itemList, parentItem}) => {
    const items = useSelector(selectAllItems);

    if(!itemList){
        return null;
    }

    return itemList.map((itemOrCategoryId, index) => {
        const currentCategoryData = categoryData[itemOrCategoryId];
        let item = false;

        if(!currentCategoryData){
            item = items.find(item => item.id === itemOrCategoryId);
        }

        return <span
            key = {`item-link-${parentItem.id}-${item?.id || currentCategoryData._id}`}
        >
            <Link
                className="contained-item-link"
                to={currentCategoryData ? `/items/${currentCategoryData?.urlName}` : `/item/${item.normalizedName}`}
            >
                {currentCategoryData ? formatCategoryName(currentCategoryData) : item.name}
            </Link>
            {itemList.length > index + 1 ? ',' : ''}
        </span>
    });
};

function ItemNameCell(props) {
    return <div
        className = 'small-item-table-description-wrapper'
    >
        <div
            className = 'small-item-table-image-wrapper'
        ><img
            alt = ''
            className = 'table-image'
            height = '64'
            loading = 'lazy'
            src = { props.row.original.iconLink }
            width = '64'
        /></div>
        <div
            className='small-item-table-name-wrapper'
        >
            <Link
                className = 'craft-reward-item-title'
                to = {props.row.original.itemLink}
            >
                {props.row.original.name}
            </Link>
            {props.row.original.notes ? <cite>{props.row.original.notes}</cite> : ''}
            {props.row.original.canHoldItems && <cite>
                Can hold:
                <ItemLinks
                    parentItem = {props.row.original}
                    itemList={props.row.original.canHoldItems}
                />
            </cite> }
        </div>
    </div>
};

export default ItemNameCell;