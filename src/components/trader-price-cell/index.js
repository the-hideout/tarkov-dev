import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // optional
import Icon from '@mdi/react';
import { mdiLock } from '@mdi/js';
import { useTranslation } from 'react-i18next';

import formatPrice from '../../modules/format-price';
import CenterCell from '../center-cell';
import capitalizeTheFirstLetterOfEachWord from '../../modules/capitalize-first';

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
    let questLocked = false;
    let loyaltyString = '';

    for (const requirement of trader.requirements) {
        if (requirement.type === 'loyaltyLevel') {
            loyaltyString = `LL${requirement.value}`;
        }

        if (requirement.type === 'questCompleted') {
            questLocked = true;
        }
    }

    if (questLocked) {
        printString = (
            <>
                {printString}
                {getItemCountPrice(trader.price, trader.currency, count)}
                <Tippy content={t('Locked behind a quest')}>
                    <div className="trader-unlock-wrapper">
                        <Icon
                            path={mdiLock}
                            size={1}
                            className="icon-with-text"
                        />
                        <span>{`${t(capitalizeTheFirstLetterOfEachWord(
                            trader.source,
                        ))} ${loyaltyString}`}</span>
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
                    {`${t(capitalizeTheFirstLetterOfEachWord(
                        trader.source,
                    ))} ${loyaltyString}`}
                </div>
            </>
        );
    }

    return <CenterCell>{printString}</CenterCell>;
}

export default TraderPriceCell;
