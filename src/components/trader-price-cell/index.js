import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // optional
import Icon from '@mdi/react';
import { mdiClipboardList } from '@mdi/js';
import { useTranslation } from 'react-i18next';

import formatPrice from '../../modules/format-price';
import CenterCell from '../center-cell';

import './index.css';

function getItemCountPrice(price, currency = 'RUB', count = 1) {
    if (count < 2) return '';
    return (
        <div key="countprice">
            {formatPrice(
                price,
                currency,
            )} x {count}
        </div>
    );
}

const ConditionalWrapper = ({ condition, wrapper, children }) => {
    return condition ? wrapper(children) : children;
};

function TraderPriceCell(props) {
    const { t } = useTranslation();
    if (!props) {
        return null;
    }

    const trader = props.row.original.buyFor
        ?.reduce((previous, current) => {
            if (current.vendor.normalizedName === 'flea-market') {
                return previous;
            }
            if (!previous || current.priceRUB < previous.priceRUB) return current;
            return previous;
        }, false);

    if (!trader) {
        return null;
    }
    let count = 1;
    if (props.row.original.count) count = props.row.original.count;
    //let printString = `${formatPrice(trader.price, trader.currency)}`;
    let printString = 
        trader.currency !== 'RUB' ? (
            <Tippy
                content={formatPrice(
                    trader.priceRUB*count,
                )}
                placement="bottom"
            >
                <div>
                    {formatPrice(
                        trader.price*count,
                        trader.currency,
                    )}
                </div>
            </Tippy>
        ) : 
            formatPrice(trader.price*count);
    const questLocked = trader.vendor.taskUnlock;
    const loyaltyString = `LL${trader.vendor.minTraderLevel}`;

    if (questLocked) {
        printString = (
            <>
                {printString}
                {getItemCountPrice(trader.price, trader.currency, count)}
                <Tippy 
                    content={`${t('Task')}: ${questLocked.name}`}
                    placement="bottom"
                >
                    <div className="trader-unlock-wrapper">
                        <Icon
                            path={mdiClipboardList}
                            size={1}
                            className="icon-with-text"
                        />
                        <span>{`${trader.vendor.name} ${loyaltyString}`}</span>
                    </div>
                </Tippy>
            </>
        );
    } else {
        printString = (
            <>
                {printString}
                {getItemCountPrice(trader.price, trader.currency, count)}
                <div className="trader-unlock-wrapper">
                    {`${trader.vendor.name} ${loyaltyString}`}
                </div>
            </>
        );
    }

    return <CenterCell>{printString}</CenterCell>;
}

export default TraderPriceCell;
