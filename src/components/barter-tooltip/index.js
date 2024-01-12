import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import ItemImage from '../item-image/index.js';
import formatPrice from '../../modules/format-price.js';
import { isAnyDogtag, getDogTagCost } from '../../modules/dogtags.js';
import { getCheapestPrice } from '../../modules/format-cost-items.js';
import { getDurationDisplay } from '../../modules/format-duration.js';

import { Icon } from '@mdi/react';
import {
    mdiCached,
    mdiProgressWrench
} from '@mdi/js';

import './index.css';

function BarterTooltip({ barter, showTitle = true, title, allowAllSources = false, crafts, barters, useBarterIngredients, useCraftIngredients }) {
    const settings = useSelector((state) => state.settings);
    const { t } = useTranslation();

    if (barters && typeof useBarterIngredients === 'undefined') {
        useBarterIngredients = true;
    }
    if (crafts && typeof useCraftIngredients === 'undefined') {
        useCraftIngredients = true;
    }
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
            const cheapestPrice = getCheapestPrice(req.item, {barters: useBarterIngredients ? barters : false, crafts: useCraftIngredients ? crafts : false, settings, allowAllSources, useBarterIngredients, useCraftIngredients});
            return {
                ...req,
                cheapestPrice,
            };
        });
    }, [barter, settings, allowAllSources, barters, crafts, useBarterIngredients, useCraftIngredients]);

    const totalCost = useMemo(() => {
        if (!requirements) {
            return 0;
        }
        return requirements.reduce((total, req) => {
            if (req.attributes.some(att => att.type === 'tool')) {
                return total;
            }
            total += req.cheapestPrice.pricePerUnit * req.count;
            return total;
        }, 0);
    }, [requirements]);

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

    if (showTitle) {
        const trader = barter.trader ? 
            `${barter.trader.name} ${t('LL{{level}}', { level: barter.level })}` :
            `${barter.station.name} ${barter.level}`;

        const tipTitle = barter.trader ?
            t('Barter at {{trader}}', { trader: trader }) : 
            t('Craft at {{station}}', {station: trader});
            
        titleElement = (
            <h3>
                <Icon
                    path={barter.trader ? mdiCached : mdiProgressWrench}
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
                let price = requiredItem.cheapestPrice.pricePerUnit;
                let sourceName = requiredItem.cheapestPrice.vendor?.normalizedName || requiredItem.cheapestPrice.craft.station.normalizedName;
                if (isAnyDogtag(requiredItem.item.id)) {
                    const dogtagCost = getDogTagCost(requiredItem, settings);
                    itemName = dogtagCost.name;
                    price = dogtagCost.price;
                    sourceName = dogtagCost.sourceNormalizedName;
                }
                let sourceImage = (
                    <img
                        alt={t('Barter')}
                        className="barter-tooltip-icon"
                        loading="lazy"
                        src={`${process.env.PUBLIC_URL}/images/traders/${sourceName}-icon.jpg`}
                    />
                );
                if (requiredItem.cheapestPrice.type === 'craft') {
                    const craftInfo = t('Craft at {{stationName}} {{stationLevel}}', {stationName: requiredItem.cheapestPrice.craft.station.name, stationLevel: requiredItem.cheapestPrice.craft.level});
                    sourceImage = (
                        <Link to={`/hideout-profit/?search=${requiredItem.item.name}`}>
                            <img
                                alt={craftInfo}
                                title={craftInfo}
                                className="barter-tooltip-icon"
                                loading="lazy"
                                src={`${process.env.PUBLIC_URL}/images/stations/${sourceName}-icon.png`}
                            />
                        </Link>
                    );
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
                                {sourceImage}
                                {requiredItem.cheapestPrice.barter && 
                                    <Link to={`/barters/?search=${requiredItem.item.name}`}>
                                        <img
                                            alt={t('Barter')}
                                            className="item-cost-barter-icon"
                                            loading="lazy"
                                            src={`${process.env.PUBLIC_URL}/images/icon-barter.png`}
                                        />
                                    </Link>
                                }
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
            {barter.rewardItems[0].count > 1 && barter.trader && <div
                className="barter-tooltip-item-wrapper"
                key={`reward-tooltip-details`}
            >
                {t('Provides {{count}} for {{totalCost}}', {count: barter.rewardItems[0].count, totalCost: formatPrice(totalCost)})}
            </div>}
            {barter.station && <div
                className="barter-tooltip-item-wrapper"
                key={`reward-tooltip-details`}
            >
                {t('Crafts {{count}} in {{duration}} for {{totalCost}}', {count: barter.rewardItems[0].count, duration: getDurationDisplay(barter.duration * 1000), totalCost: formatPrice(totalCost)})}
            </div>}
        </div>
    );
}

export default BarterTooltip;
