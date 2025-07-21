import { Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';

import formatPrice from '../../modules/format-price.js';

import './index.css';

function ValueCell(props) {
    const { 
        value, 
        highlightProfit, 
        children, 
        noValue = '-', 
        count = 1, 
        slots, 
        showSlotValue,
        valueCount = 1,
        valueDetails,
    } = props;
    const { t } = useTranslation();

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
            <Tooltip
                title={t('Cost per unit')}
                placement="bottom"
                arrow
            >
                <div className="trader-unlock-wrapper">
                    {formatPrice(Math.round(value / valueCount))}
                </div>
            </Tooltip>
        );
    }
    let slotValue = '';
    if (value && showSlotValue && slots > 1) {
        slotValue = (
            <Tooltip
                title={t('Per slot')}
                placement="bottom"
                arrow
            >
                <div className="trader-unlock-wrapper">
                    {formatPrice(Math.round(value / slots))}
                </div>
            </Tooltip>
        );
    }

    let className = '';
    if (highlightProfit && value !== 0) {
        className = value > 0 ? 'craft-profit' : 'craft-loss';
    }
    let displayValue = (
        <div className={className}>
            {value ? formatPrice(value*count) : noValue}
        </div>
    );

    if (valueDetails && Array.isArray(valueDetails) & valueDetails.length > 0) {
        displayValue = (
            <Tooltip
                title={valueDetails.map(detail => {
                    return (
                        <div key={detail.name}>
                            <span>{`${detail.name}: `}</span>
                            <span style={{float:'right', paddingLeft: '5px'}} className={detail.value > 0 ? 'craft-profit' : 'craft-loss'}>
                                {formatPrice(detail.value)}
                            </span>
                        </div>
                    );
                })}
                arrow
            >
                {displayValue}
            </Tooltip>
        );
    }
    return (
        <div className="center-content">
            {displayValue}
            {countTag}
            {slotValue}
            {children}
        </div>
    );
}

export default ValueCell;
