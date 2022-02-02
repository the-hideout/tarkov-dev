import formatPrice from '../../modules/format-price';

import './index.css';

function ValueCell({ value, highlightProfit, children, noValue = '-' }) {
    let className = 'center-content';

    if (highlightProfit) {
        className = `${className} ${value > 0 ? 'craft-profit' : 'craft-loss'}`;
    }

    return (
        <div className={className}>
            {value ? formatPrice(value) : noValue}
            {children}
        </div>
    );
}

export default ValueCell;
