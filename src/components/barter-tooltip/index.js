import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import RewardImage from '../reward-image';
import formatPrice from '../../modules/format-price';

import Icon from '@mdi/react';
import {
    mdiAccountSwitch
} from '@mdi/js';

import './index.css';

function BarterToolip({ barter, source, requiredItems, showTitle = true, title }) {
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
                {t('Barter at')} {source}
            </h3>
        );
        if (title) {
            titleElement = (
                <h4>{title}</h4>
            );
        }
    }

    return (
        <div className="cost-with-barter-wrapper">

            {titleElement}
            {requiredItems.map((requiredItem) => {
                let itemName = requiredItem.item.name;
                let price = requiredItem.item.avg24hPrice;
                let sourceName = 'flea-market';
                const isDogTag = requiredItem.attributes && requiredItem.attributes.some(att => att.name === 'minLevel');
                if (isDogTag) {
                    const bestSell = requiredItem.item.sellFor.reduce((bestPrice, sellFor) => {
                        if (sellFor.priceRUB > bestPrice.priceRUB) {
                            return sellFor;
                        }
                        return bestPrice;
                    }, {priceRUB: 0});
                    const minLevel = requiredItem.attributes.find(att => att.name === 'minLevel').value;
                    price = bestSell.priceRUB * minLevel;
                    sourceName = bestSell.vendor.normalizedName;
                    itemName = `${itemName} ≥ ${minLevel}`;
                }
                return (
                    <div
                        className="cost-item-wrapper"
                        key={`reward-tooltip-item-${requiredItem.item.id}`}
                    >
                        <RewardImage
                            count={requiredItem.count}
                            iconLink={`https://assets.tarkov.dev/${requiredItem.item.id}-icon.jpg`}
                        />
                        <div className="cost-barter-details-wrapper">
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
                                    className="barter-icon"
                                    loading="lazy"
                                    src={`${process.env.PUBLIC_URL}/images/${sourceName}-icon.jpg`}
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

export default BarterToolip;
