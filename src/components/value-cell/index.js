import Tippy from '@tippyjs/react';

import formatPrice from '../../modules/format-price';

import './index.css';

function ValueCell({ value, highlightProfit, children, noValue = '-', count = 1, slots, showSlotValue }) {
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
