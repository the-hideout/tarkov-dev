import { Link } from 'react-router-dom';
import { Tooltip } from '@mui/material';
import { Icon } from '@mdi/react';
import { mdiClipboardList } from '@mdi/js';
import { useTranslation } from 'react-i18next';

import formatPrice from '../../modules/format-price.js';
import CenterCell from '../center-cell/index.jsx';

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

function TraderPriceCell(props) {
    const { t } = useTranslation();
    if (!props) {
        return null;
    }

    const bestBuyFor = props.row.original.buyFor
        ?.reduce((previous, current) => {
            if (current.vendor.normalizedName === 'flea-market') {
                return previous;
            }
            if (!previous || current.priceRUB < previous.priceRUB) 
                return current;
            return previous;
        }, false);

    if (!bestBuyFor) {
        return null;
    }
    let count = 1;
    if (props.row.original.count)
        count = props.row.original.count;
    let printString = 
        bestBuyFor.currency !== 'RUB' ? (
            <Tooltip
                title={formatPrice(
                    bestBuyFor.priceRUB*count,
                )}
                placement="bottom"
                arrow
            >
                <div>
                    {formatPrice(
                        bestBuyFor.price*count,
                        bestBuyFor.currency,
                    )}
                </div>
            </Tooltip>
        ) : 
            formatPrice(bestBuyFor.price*count);
    const questLocked = bestBuyFor.vendor.taskUnlock;
    const loyaltyString = t('LL{{level}}', { level: bestBuyFor.vendor.minTraderLevel });

    if (questLocked) {
        printString = (
            <>
                {printString}
                {getItemCountPrice(bestBuyFor.price, bestBuyFor.currency, count)}
                <Tooltip 
                    title={<Link to={`/task/${questLocked.normalizedName}`}>{t('Task')}: {questLocked.name}</Link>}
                    placement="bottom"
                    arrow
                >
                    <div className="trader-unlock-wrapper">
                        <Icon
                            path={mdiClipboardList}
                            size={1}
                            className="icon-with-text"
                        />
                        <span>{`${bestBuyFor.vendor.name} ${loyaltyString}`}</span>
                    </div>
                </Tooltip>
            </>
        );
    } else {
        printString = (
            <>
                {printString}
                {getItemCountPrice(bestBuyFor.price, bestBuyFor.currency, count)}
                <div className="trader-unlock-wrapper">
                    {`${bestBuyFor.vendor.name} ${loyaltyString}`}
                </div>
            </>
        );
    }

    return <CenterCell>{printString}</CenterCell>;
}

export default TraderPriceCell;
