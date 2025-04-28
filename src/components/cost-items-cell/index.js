import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import ItemCost from '../item-cost/index.js';
import ItemImage from '../item-image/index.js';

import './index.css';

import { toggleItem as toggleCraftItem } from '../../features/crafts/index.js';
import { toggleItem as toggleBarterItem } from '../../features/barters/index.js';

function CostItemsCell({ costItems, craftId, barterId, allowAllSources = false, crafts, barters, useCraftIngredients, useBarterIngredients }) {
    const dispatch = useDispatch();

    return (
        <div className="cost-wrapper">
            {costItems.map((costItem, itemIndex) => {
                return (
                    <div
                        key={`cost-item-${itemIndex}`}
                        className={`cost-item-wrapper ${costItem.count === 0 ? 'disabled' : ''}`}
                        onClick={(event) => {
                            // Don't allow to toggle/disable tools
                            if (costItem.isTool === true) {
                                return true;
                            }
                            // Don't hook A's
                            if (event.target.nodeName === 'A') {
                                return true;
                            }
                            if (event.target.nodeName === 'path') {
                                return true;
                            }
                            if (event.target.classList.contains('no-click')) {
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
                            <ItemImage
                                item={costItem.item}
                                attributes={costItem.attributes}
                                count={costItem.count}
                                imageField="iconLink"
                                linkToItem={true}
                                nonFunctional={costItem.nonFunctional}
                            />
                        </div>
                        <div className="cost-item-text-wrapper">
                            <Link to={costItem.itemLink}>{costItem.name}</Link>
                            <div className={`${costItem.isTool ? 'price-wrapper-tool' : 'price-wrapper'}`}>
                                <ItemCost
                                    itemId={costItem.id}
                                    priceDetails={costItem.priceDetails}
                                    craftId={craftId}
                                    barterId={barterId}
                                    count={costItem.count}
                                    price={costItem.pricePerUnit}
                                    vendor={costItem.vendor}
                                    priceType={costItem.priceType}
                                    isTool={costItem.isTool}
                                    allowAllSources={allowAllSources}
                                    barters={barters}
                                    crafts={crafts}
                                    useBarterIngredients={useBarterIngredients}
                                    useCraftIngredients={useCraftIngredients}
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
