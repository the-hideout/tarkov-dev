import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // optional
import Icon from '@mdi/react';
import { mdiLock } from '@mdi/js';

import formatPrice from '../../modules/format-price';
import CenterCell from '../center-cell';
import capitalizeTheFirstLetterOfEachWord from '../../modules/capitalize-first';

import './index.css';

function TraderPriceCell({value}) {
    if(!value){
        return null;
    }

    let printString = `${formatPrice(value.price, value.currency)}`;
    let questLocked = false;
    let loyaltyString = '';

    for(const requirement of value.requirements){
        if(requirement.type === 'loyaltyLevel'){
            loyaltyString = `LL${requirement.value}`;
        }

        if(requirement.type === 'questCompleted'){
            questLocked = true;
        }
    }

    if(questLocked) {
        printString = <div >
            {printString}
            <Tippy
                content = {'Locked behind a quest'}
            >
                <div
                    className = 'trader-unlock-wrapper'
                >
                    <Icon
                        path={mdiLock}
                        size={1}
                        className = 'icon-with-text'
                    />
                    {`${capitalizeTheFirstLetterOfEachWord(value.source)} ${loyaltyString}`}
                </div>
            </Tippy>
        </div>;
    } else {
        printString = <div>
            {printString}
            <div
                className = 'trader-unlock-wrapper'
            >
                {`${capitalizeTheFirstLetterOfEachWord(value.source)} ${loyaltyString}`}
            </div>
        </div>;
    }

    return <CenterCell>
        {printString}
    </CenterCell>;
};

export default TraderPriceCell;