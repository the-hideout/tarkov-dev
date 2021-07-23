import {
    Link,
} from "react-router-dom";

import ItemCost from '../item-cost';
import './index.css';

function CostItemsCell({ costItems }) {
    return <div
        className = 'cost-wrapper'
    >
        {costItems.map((costItem, itemIndex) => {
            return <div
                key = {`cost-item-${itemIndex}`}
                className = 'cost-item-wrapper'
            >
                <div
                    className = 'cost-image-wrapper'
                ><img
                        alt = {costItem.name}
                        loading = 'lazy'
                        src = {costItem.iconLink}
                    /></div>
                <div
                    className = 'cost-item-text-wrapper'
                >
                    <Link
                        to = {costItem.itemLink}
                    >
                        {costItem.name}
                    </Link>
                    <div
                        className = 'price-wrapper'
                    >
                        <ItemCost
                            price = {costItem.price}
                            priceSource = {costItem.priceSource}
                            count = {costItem.count}
                            alternatePrice = {costItem.alternatePrice}
                            alternatePriceSource = {costItem.alternatePriceSource}
                        />
                    </div>
                </div>
            </div>
        })}
    </div>;
};

export default CostItemsCell;