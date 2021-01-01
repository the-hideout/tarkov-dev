import BarterItemTooltip from './BarterItemTooltip';
import BarterItemSellToIcon from './BarterItemSellToIcon';

function BarterItem(props) {
    let imgSrc = props.src;
    const noop = () => {};

    if(props.width > props.height && !(props.width === 3 && props.height === 2) && !(props.width === 4 && props.height === 2)){
        imgSrc = `//images.weserv.nl/?url=${encodeURIComponent(imgSrc)}&ro=-90}`;
    } else if (props.height === 3 && props.width === 2){
        imgSrc = `//images.weserv.nl/?url=${encodeURIComponent(imgSrc)}&ro=-90}`;
    }

    return <a
        href = {props.wikiLink}
        className = {`barter-item barter-icon-${props.width}x${props.height}`}
        onClick = {props.onClick|| noop}
    >
        <BarterItemTooltip
            pricePerSlot = {props.pricePerSlot}
            slots = {props.slots}
            sellTo = {props.sellTo}
        />
        <BarterItemSellToIcon
            sellTo = {props.sellTo}
        />

        <img
            alt = {props.name}
            src = {imgSrc}
        />
    </a>
}

export default BarterItem;


