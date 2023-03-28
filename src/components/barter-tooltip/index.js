import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import ItemImage from '../item-image';
import formatPrice from '../../modules/format-price';
import { isAnyDogtag, getDogTagCost } from '../../modules/dogtags';
import { getCheapestItemPrice } from '../../modules/format-cost-items';

import Icon from '@mdi/react';
import {
    mdiAccountSwitch
} from '@mdi/js';

import './index.css';

function BarterTooltip({ barter, showTitle = true, title, allowAllSources }) {
    const settings = useSelector((state) => state.settings);
    const { t } = useTranslation();

    const requirements = useMemo(() => {
        if (!barter) {
            return false;
        }
        const items = barter.requiredItems;
        if (!items) {
            // Should never happen
            return false;
        }
        return items.map(req => {
            const cheapestPrice = getCheapestItemPrice(req.item, settings, allowAllSources);
            return {
                ...req,
                cheapestPrice,
            };
        });
    }, [barter, settings, allowAllSources]);

    if (!barter) {
        return t('No barters found for this item');
    }
    if (!barter.trader && !barter.station) {
        // Should never happen
        return "Missing trader for this barter";
    }
    if (!requirements) {
        // Should never happen
        return "Missing requirements for this barter";
    }

    let titleElement = '';
    let trader = barter.trader ? 
        `${barter.trader.name} ${t('LL{{level}}', { level: barter.level })}` :
        `${barter.station.name} ${barter.level}`;

    if (showTitle) {
        const tipTitle = barter.trader ?
            t('Barter at {{trader}}', { trader: trader }) : 
            t('Craft at {{station}}', {station: trader});
            
        titleElement = (
            <h3>
                <Icon
                    path={mdiAccountSwitch}
                    size={1}
                    className="icon-with-text"
                />
                {tipTitle}
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
            {requirements.map((requiredItem) => {
                let itemName = requiredItem.item.name;
                let price = requiredItem.cheapestPrice.priceRUB;
                let sourceName = requiredItem.cheapestPrice.vendor.normalizedName;
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
                        <div className="barter-required-item-image">
                            <ItemImage
                                item={requiredItem.item}
                                attributes={requiredItem.attributes}
                                count={requiredItem.count}
                                imageField="iconLink"
                                nonFunctionalOverlay={false}
                                linkToItem={true}
                            />
                        </div>
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
