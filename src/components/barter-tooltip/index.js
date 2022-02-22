import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import RewardImage from '../reward-image';

import formatPrice from '../../modules/format-price';

import './index.css';

function BarterToolip({ source, requiredItems }) {
    const { t } = useTranslation();

    if (!source || !requiredItems) {
        return null;
    }

    return (
        <div className="cost-with-barter-wrapper">
            <h3>
                {t('Barter at')} {source}
            </h3>
            {requiredItems.map((requiredItem) => {
                return (
                    <div
                        className="cost-item-wrapper"
                        key={`reward-tooltip-item-${requiredItem.item.id}`}
                    >
                        <RewardImage
                            count={requiredItem.count}
                            iconLink={`https://assets.tarkov-tools.com/${requiredItem.item.id}-icon.jpg`}
                        />
                        <div className="cost-barter-details-wrapper">
                            <div>
                                <Link
                                    to={`/item/${requiredItem.item.normalizedName}`}
                                >
                                    {requiredItem.item.name}
                                </Link>
                            </div>
                            <div className="price-wrapper">
                                <img
                                    alt={t('Barter')}
                                    className="barter-icon"
                                    loading="lazy"
                                    src={`${process.env.PUBLIC_URL}/images/flea-market-icon.jpg`}
                                />
                                {requiredItem.count} <span>X</span>{' '}
                                {formatPrice(requiredItem.item.avg24hPrice)}{' '}
                                <span>=</span>{' '}
                                {formatPrice(
                                    requiredItem.count *
                                        requiredItem.item.avg24hPrice,
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default BarterToolip;
