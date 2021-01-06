import formatPrice from '../modules/format-price';

function BarterItemTooltip(props) {
    if(!props.pricePerSlot){
        return false;
    }

    return <span
        className = {'barter-item-tooltip'}
    >
        <div>Value: {formatPrice(props.pricePerSlot * props.slots)}</div>
        <div>Per slot: {formatPrice(props.pricePerSlot)}</div>
        <div>Sell to: {props.sellTo}</div>
    </span>
};

export default BarterItemTooltip;
