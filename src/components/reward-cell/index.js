import {
    Link
} from "react-router-dom";
import { useTranslation } from 'react-i18next';

import formatPrice from "../../modules/format-price";
import './index.css';

function RewardCell({count, iconLink, itemLink, name, source, value, sellTo, barterOnly = false}) {
    const { t } = useTranslation();

    return <div
        className = 'reward-wrapper'
    >
        <div
            className = 'reward-image-wrapper'
        >{count && <span
            className = 'reward-count-wrapper'
        >
            {count}
        </span>}<img
                alt = ''
                className = 'table-image'
                loading = 'lazy'
                height = '64'
                width = '64'
                src = { iconLink }
            /></div>
        <div
            className = 'reward-info-wrapper'
        >
            <div>
                <Link
                    className = 'reward-item-title'
                    to = {itemLink}

                >
                    {name}
                </Link>
            </div>
            <div
                className = 'source-wrapper'
            >
                {source}
            </div>
            <div
                className = 'price-wrapper'
            >
                {formatPrice(value)} @ {sellTo}
                {barterOnly && <span> ({t('Barter only')})</span>}
            </div>
        </div>
    </div>
}

export default RewardCell;
