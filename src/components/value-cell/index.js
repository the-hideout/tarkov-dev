import formatPrice from '../../modules/format-price';

import './index.css';

function ValueCell({ value, highlightProfit, children, noValue = '-', count = 1 }) {
    let className = 'center-content';

    if (highlightProfit) {
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
    return (
        <div className={className}>
            {value ? formatPrice(value*count) : noValue}
            {countTag}
            {children}
        </div>
    );
}

export default ValueCell;
