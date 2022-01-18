import Tippy from '@tippyjs/react';
import {followCursor} from 'tippy.js';
import 'tippy.js/dist/tippy.css'; // optional
import { useTranslation } from 'react-i18next';

import BarterToolip from '../barter-tooltip';
import formatPrice from '../../modules/format-price';

import './index.css';

const TRADERS = [
    'prapor',
    'therapist',
    'fence',
    'skier',
    'peacekeeper',
    'mechanic',
    'ragman',
    'jaeger',
];

function ItemCost({count, price, alternatePrice, alternatePriceSource, priceSource = 'flea'}) {
    const { t } = useTranslation();

    if(priceSource === 'fleaMarket'){
        return <div>
            <img
                alt = {t('Flea market')}
                className = 'barter-icon'
                src = {`${ process.env.PUBLIC_URL }/images/flea-market-icon.jpg`}
            />
            <span>
                {count}
            </span> X {formatPrice(price)} = {formatPrice(count * (alternatePrice || price))}
        </div>;
    }

    if(priceSource === 'barter'){
        return <Tippy
            placement = 'bottom'
            followCursor = {'horizontal'}
            // showOnCreate = {true}
            interactive = {true}
            content={<BarterToolip
                source = {alternatePriceSource.source}
                requiredItems={alternatePriceSource.requiredItems}
            />
            }
            plugins={[followCursor]}
        >
            <div>
                <img
                    alt = {t('Barter')}
                    className = 'barter-icon'
                    loading='lazy'
                    src = {`${ process.env.PUBLIC_URL }/images/icon-barter.png`}
                />
                <span>
                    {count}
                </span> X {formatPrice(price)} = {formatPrice(count * (alternatePrice || price))}
            </div>
        </Tippy>
    }

    if(TRADERS.includes(priceSource)){
        return <div>
            <img
                alt = {t(priceSource)}
                className = 'barter-icon'
                loading='lazy'
                src = {`${ process.env.PUBLIC_URL }/images/${priceSource}-icon.jpg`}
            />
            <span>
                {count}
            </span> X {formatPrice(price)} = {formatPrice(count * (alternatePrice || price))}
        </div>
    }

    return null;
}

export default ItemCost;