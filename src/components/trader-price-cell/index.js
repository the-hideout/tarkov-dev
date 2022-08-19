import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // optional
import Icon from '@mdi/react';
import { mdiLock } from '@mdi/js';
import { useTranslation } from 'react-i18next';

import formatPrice from '../../modules/format-price';
import CenterCell from '../center-cell';
import capitalizeTheFirstLetterOfEachWord from '../../modules/capitalize-first';

import './index.css';

function TraderPriceCell(props) {
    const { t } = useTranslation();
    if (!props) {
        return null;
    }

    const trader = props.row.original.buyFor
        ?.map((buyFor) => {
            if (buyFor.source === 'flea-market') {
                return false;
            }

            return buyFor;
        })
        .filter(Boolean)[0];

    if (!trader) {
        return null;
    }

    //let printString = `${formatPrice(trader.price, trader.currency)}`;
    let printString = 
        trader.currency !== 'RUB' ? (
            <Tippy
                content={formatPrice(
                    trader.priceRUB,
                )}
                placement="bottom"
            >
                <>
                    {formatPrice(
                        trader.price,
                        trader.currency,
                    )}
                </>
            </Tippy>
        ) : 
            formatPrice(trader.price);
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
