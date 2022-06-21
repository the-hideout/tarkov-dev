import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import ItemCost from '../item-cost';
import RewardImage from '../reward-image';
import './index.css';
import { toggleItem as toggleCraftItem } from '../../features/crafts/craftsSlice';
import { toggleItem as toggleBarterItem } from '../../features/barters/bartersSlice';

function CostItemsCell({ costItems, craftId, barterId }) {
    const dispatch = useDispatch();

    return (
        <div className="cost-wrapper">
            {costItems.map((costItem, itemIndex) => {

                // Check if the item attribute is a tool
                const isTool = costItem.attributes.some(element => element.type === "tool");
            
                return (
                    <div
                        key={`cost-item-${itemIndex}`}
                        className={`cost-item-wrapper ${
                            costItem.count === 0 ? 'disabled' : ''
                        }`}
                        onClick={(event) => {
                            // Don't hook A's
                            if (event.target.nodeName === 'A') {
                                return true;
                            }
                            dispatch(
                                toggleCraftItem({
                                    itemId: costItem.id,
                                }),
                            );
                            dispatch(
                                toggleBarterItem({
                                    itemId: costItem.id,
                                }),
                            );
                        }}
                    >
                        <div className="cost-image-wrapper">
                            <RewardImage
                                count={costItem.count}
                                iconLink={`https://assets.tarkov.dev/${costItem.id}-icon.jpg`}
                                height="34"
                                width="34"
                                isTool={isTool}
                            />
                        </div>
                        <div className="cost-item-text-wrapper">
                            <Link to={costItem.itemLink}>{costItem.name}</Link>
                            <div className={`${isTool ? 'price-wrapper-tool' : 'price-wrapper'}`}>
                                <ItemCost
                                    alternatePrice={costItem.alternatePrice}
                                    alternatePriceSource={
                                        costItem.alternatePriceSource
                                    }
                                    craftId={craftId}
                                    barterId={barterId}
                                    count={costItem.count}
                                    price={costItem.price}
                                    priceSource={costItem.priceSource}
                                />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default CostItemsCell;
