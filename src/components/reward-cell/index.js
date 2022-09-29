import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Tippy from '@tippyjs/react';

import RewardImage from '../reward-image';

import formatPrice from '../../modules/format-price';
import './index.css';

function RewardCell(props) {
    const {
        count,
        iconLink,
        itemLink,
        name,
        source,
        sellValue,
        sellTo,
        sellNote = false
    } = props;
    const { t } = useTranslation();

    let barterCraftOnly = '';
    if (sellNote) {
        barterCraftOnly = (<span> ({sellNote})</span>);
    }

    let displayValue = '';
    if (sellValue) {
        displayValue = `${formatPrice(sellValue)} @ ${sellTo}`;
    }

    return (
        <div className="reward-wrapper">
            <RewardImage count={count} iconLink={iconLink} />
            <div className="reward-info-wrapper">
                <div>
                    <Link className="reward-item-title" to={itemLink}>
                        {name}
                    </Link>
                </div>
                <div className="source-wrapper">{source}</div>
                <Tippy
                    content={t('Sell value')}
                    placement="bottom"
                >
                    <div className="price-wrapper">
                        {displayValue}
                        {barterCraftOnly}
                    </div>
                </Tippy>
            </div>
        </div>
    );
}

export default RewardCell;
