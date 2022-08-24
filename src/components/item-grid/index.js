import { useTranslation } from 'react-i18next';

import Item from './Item';
import formatPrice from '../../modules/format-price';

import './index.css';

const getSubtitle = (text, minPrice, maxPrice, t) => {
    if (minPrice || maxPrice) {
        return (
            <div className="item-group-subtitle-wrapper">
                <span>{`${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`}</span>
                <div className="note">{t('per slot')}</div>
            </div>
        );
    }

    return (
        <div className="item-group-subtitle-wrapper">
            {text}
        </div>
    );
};

function ItemGrid(props) {
    const { t } = useTranslation();
    let minPrice = false;
    let maxPrice = false;

    for (const item of props.items) {
        if (!minPrice || item.pricePerSlot < minPrice) {
            minPrice = item.pricePerSlot;
        }

        if (!maxPrice || item.pricePerSlot > maxPrice) {
            maxPrice = item.pricePerSlot;
        }
    }

    minPrice = Math.floor(minPrice / 1000) * 1000;
    maxPrice = Math.ceil(maxPrice / 1000) * 1000;

    let className = 'item-group-wrapper';

    if (props.name.length <= 2) {
        className = `${className} big`;
    }

    return (
        <div className={className}>
            <div className="item-group-title">
                <div className="barter-class-wrapper">{props.name}</div>
                {getSubtitle(props.subtitle, minPrice, maxPrice, t)}
                {props.extraTitleProps}
            </div>
            <div className="item-group-items">
                {props.items.map((item) => (
                    <Item
                        key={`${props.normalizedName}-${item.id}`}
                        onClick={item.onClick}
                        count={item.count}
                        name={item.name}
                        pricePerSlot={item.pricePerSlot}
                        sellTo={item.sellTo}
                        sellToNormalized={item.sellToNormalized}
                        slots={item.gridImageLink ? item.slots : 1}
                        src={item.gridImageLink || item.fallbackImageLink}
                        itemLink={`/item/${item.normalizedName}`}
                        height={item.gridImageLink ? item.height : 1}
                        width={item.gridImageLink ? item.width : 1}
                        item={item}
                    />
                ))}
            </div>
        </div>
    );
}

export default ItemGrid;
