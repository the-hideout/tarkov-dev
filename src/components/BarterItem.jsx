import BarterItemTooltip from './BarterItemTooltip';
import BarterItemSellToIcon from './BarterItemSellToIcon';

const sizesNotToRotate = [
    '3x2',
    '4x2',
    '5x1',
    '5x2',
    '5x3',
];

const sizesToAlwaysRotate = [
    '2x3',
];

function BarterItem(props) {
    let imgSrc = props.src;
    const noop = () => {};

    const gridSize = `${props.width}x${props.height}`;

    if(props.width > props.height && !sizesNotToRotate.includes(gridSize)){
        imgSrc = `//images.weserv.nl/?url=${encodeURIComponent(imgSrc)}&ro=-90`;
    } else if (sizesToAlwaysRotate.includes(gridSize)){
        imgSrc = `//images.weserv.nl/?url=${encodeURIComponent(imgSrc)}&ro=-90`;
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


