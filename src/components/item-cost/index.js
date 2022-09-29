import Tippy from '@tippyjs/react';
import { followCursor } from 'tippy.js';
import 'tippy.js/dist/tippy.css'; // optional
import { useTranslation } from 'react-i18next';
import Icon from '@mdi/react';
import { mdiTimerSand } from '@mdi/js';

import BarterToolip from '../barter-tooltip';
import formatPrice from '../../modules/format-price';

const ConditionalWrapper = ({ condition, wrapper, children }) => {
    return condition ? wrapper(children) : children;
};

function ItemCost({
    count,
    price,
    vendor = {name: 'Flea Market', normalizedName: 'flea-market'},
    priceType = 'cash',
    priceDetails,
}) {
    const { t } = useTranslation();

    let tooltip = false;
    let displayImage = (
        <img
            alt={vendor.name}
            className="barter-icon"
            src={`${process.env.PUBLIC_URL}/images/${vendor.normalizedName}-icon.jpg`}
            loading="lazy"
        />
    );
    let displayPrice = count + ' x ' + formatPrice(price) + ' = ' + formatPrice(count * price);

    if (priceType === 'cached') {
        displayPrice = count
        displayImage =  (
            <Icon
                path={mdiTimerSand}
                size={0.5}
                className="icon-with-text"
            />
        );
        tooltip = t('Flea market prices loading');
    }

    if (priceType === 'barter') {
        displayImage = (
            <img
                alt={t('Barter')}
                className="barter-icon"
                loading="lazy"
                src={`${process.env.PUBLIC_URL}/images/icon-barter.png`}
            />
        );
        tooltip = (
            <BarterToolip
                source={vendor.name}
                requiredItems={priceDetails.requiredItems}
            />
        );
    }

    return (
        <ConditionalWrapper
            condition={tooltip}
            wrapper={(children) => {
                return (
                    <Tippy 
                        placement="bottom"
                        followCursor={'horizontal'}
                        // showOnCreate = {true}
                        interactive={true}
                        content={tooltip}
                        plugins={[followCursor]}
                    >
                        {children}
                    </Tippy>
                );
            }}
        >
            <div>
                {displayImage}
                {displayPrice}
            </div>
        </ConditionalWrapper>
    );
}

export default ItemCost;
