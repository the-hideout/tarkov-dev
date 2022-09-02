import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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
        barterOnly = false,
    } = props;
    const { t } = useTranslation();

    return (
        <div className="reward-wrapper">
            <RewardImage count={count} iconLink={iconLink} />
            <div className="reward-info-wrapper">
                <div>
                    <Link className="reward-item-title" to={itemLink}>
                        {name}
                    </Link>
                </div>
                <div className="source-wrapper">{source}</div>{barterOnly && <span> ({t('Barter only')})</span>}
                <div className="price-wrapper">
                    {formatPrice(sellValue)} <span>@</span> {sellTo}
                    {barterOnly && <span> ({t('Barter only')})</span>}
                </div>
            </div>
        </div>
    );
}

export default RewardCell;
