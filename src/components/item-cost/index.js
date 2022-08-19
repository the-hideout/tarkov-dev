import Tippy from '@tippyjs/react';
import { followCursor } from 'tippy.js';
import 'tippy.js/dist/tippy.css'; // optional
import { useTranslation } from 'react-i18next';

import BarterToolip from '../barter-tooltip';
import formatPrice from '../../modules/format-price';

function ItemCost({
    count,
    price,
    vendor = {name: 'Flea Market', normalizedName: 'flea-market'},
    priceType = 'cash',
    priceDetails,
}) {
    const { t } = useTranslation();

    if (priceType === 'barter') {
        return (
            <Tippy
                placement="bottom"
                followCursor={'horizontal'}
                // showOnCreate = {true}
                interactive={true}
                content={
                    <BarterToolip
                        source={vendor.name}
                        requiredItems={priceDetails.requiredItems}
                    />
                }
                plugins={[followCursor]}
            >
                <div>
                    <img
                        alt={t('Barter')}
                        className="barter-icon"
                        loading="lazy"
                        src={`${process.env.PUBLIC_URL}/images/icon-barter.png`}
                    />
                    {count + ' x ' + formatPrice(price) + ' = '}
                    {formatPrice(count * price)}
                </div>
            </Tippy>
        );
    }

    return (
        <div>
            <img
                alt={vendor.name}
                className="barter-icon"
                src={`${process.env.PUBLIC_URL}/images/${vendor.normalizedName}-icon.jpg`}
                loading="lazy"
            />
            {count + ' x ' + formatPrice(price) + ' = '}
            {formatPrice(count * price)}
        </div>
    );
}

export default ItemCost;
