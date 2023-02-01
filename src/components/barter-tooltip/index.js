import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import RewardImage from '../reward-image';
import formatPrice from '../../modules/format-price';
import { isAnyDogtag, getDogTagCost } from '../../modules/dogtags';
import { getCheapestItemPrice } from '../../modules/format-cost-items';

import Icon from '@mdi/react';
import {
    mdiAccountSwitch
} from '@mdi/js';

import './index.css';

function BarterTooltip({ barter, source, requiredItems, showTitle = true, title, allowAllSources }) {
    const settings = useSelector((state) => state.settings);
    const { t } = useTranslation();
    source = source || barter?.source;
    requiredItems = requiredItems || barter?.requiredItems;

    if (!source || !requiredItems) {
        return "No barters found for this item";
    }

    let titleElement = '';
    if (showTitle) {
        titleElement = (
            <h3>
                <Icon
                    path={mdiAccountSwitch}
                    size={1}
                    className="icon-with-text"
                />
                {t('Barter at {{trader}}', { trader: source })}
            </h3>
        );
        if (title) {
            titleElement = (
                <h4>{title}</h4>
            );
        }
    }

    return (
        <div className="barter-tooltip-wrapper">

            {titleElement}
            {requiredItems.map((requiredItem) => {
                let itemName = requiredItem.item.name;
                const cheapestPrice = getCheapestItemPrice(requiredItem.item, settings, allowAllSources);
                let price = cheapestPrice.priceRUB;
                let sourceName = cheapestPrice.vendor.normalizedName;
                if (isAnyDogtag(requiredItem.item.id)) {
                    const dogtagCost = getDogTagCost(requiredItem, settings);
                    itemName = dogtagCost.name;
                    price = dogtagCost.price;
                    sourceName = dogtagCost.sourceNormalizedName;
                }
                return (
                    <div
                        className="barter-tooltip-item-wrapper"
                        key={`reward-tooltip-item-${requiredItem.item.id}`}
                    >
                        <RewardImage
                            count={requiredItem.count}
                            iconLink={`https://assets.tarkov.dev/${requiredItem.item.id}-icon.jpg`}
                        />
                        <div className="barter-tooltip-details-wrapper">
                            <div>
                                <Link
                                    to={`/item/${requiredItem.item.normalizedName}`}
                                >
                                    {itemName}
                                </Link>
                            </div>
                            <div className="price-wrapper">
                                <img
                                    alt={t('Barter')}
                                    className="barter-tooltip-icon"
                                    loading="lazy"
                                    src={`${process.env.PUBLIC_URL}/images/traders/${sourceName}-icon.jpg`}
                                />
                                {requiredItem.count} <span>X</span>{' '}
                                {formatPrice(price)}{' '}
                                <span>=</span>{' '}
                                {formatPrice(
                                    requiredItem.count *
                                    price,
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default BarterTooltip;
