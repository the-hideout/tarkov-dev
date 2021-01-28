import formatPrice from '../../modules/format-price';

function ItemTooltip(props) {
    if(!props.pricePerSlot){
        return false;
    }

    return <span
        className = {'grid-item-tooltip'}
    >
        <div
            className = {'grid-item-tooltip-title'}
        >
            {props.name}
        </div>
        <div>Value: {formatPrice(props.pricePerSlot * props.slots)}</div>
        <div>Per slot: {formatPrice(props.pricePerSlot)}</div>
        <div>Sell to: {props.sellTo}</div>
    </span>
};

export default ItemTooltip;
