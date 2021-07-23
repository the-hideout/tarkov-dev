import Tippy from '@tippyjs/react';
import {followCursor} from 'tippy.js';
import 'tippy.js/dist/tippy.css'; // optional

import formatPrice from '../../modules/format-price';

const priceToUse = 'lastLowPrice';

function ItemCost({count, price, alternatePrice, alternatePriceSource, priceSource = 'flea'}) {
    if(priceSource === 'flea'){
        return <div>
            <span>{count} </span> X {formatPrice(price)} = {formatPrice(count * (alternatePrice || price))}
        </div>;
    }

    if(priceSource === 'barter'){
        return <Tippy
            placement = 'bottom'
            followCursor = {'horizontal'}
            // showOnCreate = {true}
            content={
                <div
                    className = 'cost-with-barter-wrapper'
                >
                    <img
                        alt = 'Icon'
                        src = {`https://assets.tarkov-tools.com/${alternatePriceSource.requiredItems[0].item.id}-icon.jpg`}
                    />
                    <div
                        className = 'cost-barter-details-wrapper'
                    >
                        <div>
                            {alternatePriceSource.requiredItems[0].item.name}
                        </div>
                        <div>
                            {formatPrice(alternatePriceSource.requiredItems[0].item[priceToUse])}
                        </div>
                        <div>
                            {alternatePriceSource.source}
                        </div>
                    </div>
                </div>
            }
            plugins={[followCursor]}
        >
            <div>
                <span>
                    {count}
                </span> X <img
                    alt = 'Barter'
                    className = 'barter-icon'
                    src = {`${ process.env.PUBLIC_URL }/images/icon-barter.png`}
                />{formatPrice(price)} = {formatPrice(count * (alternatePrice || price))}
            </div>
        </Tippy>
    }

    return null;
}

export default ItemCost;