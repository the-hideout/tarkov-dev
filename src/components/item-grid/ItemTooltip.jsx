import { useTranslation } from 'react-i18next';

import formatPrice from '../../modules/format-price';

function ItemTooltip(props) {
    const { t } = useTranslation();

    if (!props.pricePerSlot) {
        return false;
    }

    return (
        <span className={'grid-item-tooltip'}>
            <div className={'grid-item-tooltip-title'}>{props.name}</div>
            <>
                {t('Value')}: {formatPrice(props.pricePerSlot * props.slots)}
            </>
            <>
                {t('Per slot')}: {formatPrice(props.pricePerSlot)}
            </>
            <>
                {t('Sell to')}: {props.sellTo}
            </>
        </span>
    );
}

export default ItemTooltip;
