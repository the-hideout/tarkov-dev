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
                return (
                    <div
                        key={`cost-item-${itemIndex}`}
                        className={`cost-item-wrapper ${
                            costItem.count === 0 ? 'disabled' : ''
                        }`}
                        onClick={(event) => {
                            // Don't allow to toggle/disable tools
                            if (costItem.isTool === true) {
                                return true;
                            }
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
                                isTool={costItem.isTool}
                            />
                        </div>
                        <div className="cost-item-text-wrapper">
                            <Link to={costItem.itemLink}>{costItem.name}</Link>
                            <div className={`${costItem.isTool ? 'price-wrapper-tool' : 'price-wrapper'}`}>
                                <ItemCost
                                    priceDetails={costItem.priceDetails}
                                    craftId={craftId}
                                    barterId={barterId}
                                    count={costItem.count}
                                    price={costItem.priceRUB}
                                    vendor={costItem.vendor}
                                    priceType={costItem.priceType}
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
