import Tippy from '@tippyjs/react';
import { useTranslation } from 'react-i18next';

import formatPrice from '../../modules/format-price';

import './index.css';

function ValueCell({ 
    value, 
    highlightProfit, 
    children, 
    noValue = '-', 
    count = 1, 
    slots, 
    showSlotValue,
    valueCount = 1
}) {
    const { t } = useTranslation();

    let className = 'center-content';

    if (highlightProfit && value !== 0) {
        className = `${className} ${value > 0 ? 'craft-profit' : 'craft-loss'}`;
    }

    let countTag = '';
    if (count > 1 && value) {
        countTag = (
            <div>
                {formatPrice(value)} x {count}
            </div>
        );
    }
    if (valueCount > 1) {
        countTag = (
            <Tippy
                content={t('Cost per unit')}
                placement="bottom"
            >
                <div class="trader-unlock-wrapper">
                    {formatPrice(Math.round(value / valueCount))}
                </div>
            </Tippy>
        );
    }
    let slotValue = '';
    if (value && showSlotValue && slots > 1) {
        slotValue = (
            <Tippy
                content="Per slot"
                placement="bottom"
            >
                <div className="trader-unlock-wrapper">
                    {formatPrice(Math.round(value / slots))}
                </div>
            </Tippy>
        );
    }
    return (
        <div className={className}>
            {value ? formatPrice(value*count) : noValue}
            {countTag}
            {slotValue}
            {children}
        </div>
    );
}

export default ValueCell;
