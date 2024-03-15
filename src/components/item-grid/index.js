import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom";

import ItemImage from '../item-image/index.js';
import ItemTooltip from './ItemTooltip.jsx';
import ItemIcon from './ItemIcon.jsx';
import formatPrice from '../../modules/format-price.js';

import './index.css';

const getSubtitle = (text, minPrice, maxPrice, t) => {
    if (minPrice || maxPrice) {
        return (
            <div className="item-group-subtitle-wrapper">
                <div>{formatPrice(maxPrice)}</div>
                <div>{'⇩'}</div>
                <div>{formatPrice(minPrice)}</div>
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

    minPrice = Math.ceil(minPrice / 250) * 250;
    maxPrice = Math.ceil(maxPrice / 250) * 250;

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
                    <Link
                        key={`${item.normalizedName}-${item.id}`}
                        to={`/item/${item.normalizedName}`}
                        className={`grid-item`}
                        style={{gridRowEnd: `span ${item.baseImageLink ? item.height : 1}`, gridColumnEnd: `span ${item.baseImageLink ? item.width : 1}`}}
                    >
                        <ItemImage
                            item={item}
                        >
                            <ItemTooltip
                                key={`${item.id}-tooltip`}
                                pricePerSlot={item.pricePerSlot}
                                slots={item.baseImageLink ? item.slots : 1}
                                sellTo={item.sellTo}
                                name={item.name}
                            />
                            <ItemIcon
                                key={`${item.id}-sellicon`}
                                sellTo={item.sellTo}
                                sellToNormalized={item.sellToNormalized}
                                count={item.count}
                            />
                        </ItemImage>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default ItemGrid;
