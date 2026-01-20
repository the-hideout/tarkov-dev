import { Link } from "react-router-dom";

import ItemTooltip from "./ItemTooltip.jsx";
import ItemIcon from "./ItemIcon.jsx";

// const sizesNotToRotate = [
//     '3x2',
//     '4x2',
//     '4x1',
//     '5x1',
//     '5x2',
//     '5x3',
//     '6x1',
//     '7x1',
// ];

// const sizesToAlwaysRotate = ['2x3'];

function Item(props) {
    let imgSrc = props.src;

    //const gridSize = `${props.width}x${props.height}`;
    //
    // if (props.width > props.height && !sizesNotToRotate.includes(gridSize)) {
    //     imgSrc = `//images.weserv.nl/?url=${encodeURIComponent(imgSrc)}&ro=-90`;
    // } else if (sizesToAlwaysRotate.includes(gridSize)) {
    //     imgSrc = `//images.weserv.nl/?url=${encodeURIComponent(imgSrc)}&ro=-90`;
    // }

    return (
        <Link
            to={props.itemLink}
            className={`grid-item`}
            style={{ gridRowEnd: `span ${props.height}`, gridColumnEnd: `span ${props.width}` }}
        >
            <ItemTooltip
                pricePerSlot={props.pricePerSlot}
                slots={props.slots}
                sellTo={props.sellTo}
                name={props.name}
            />
            <ItemIcon sellTo={props.sellTo} sellToNormalized={props.sellToNormalized} count={props.count} />

            <img alt={props.name} loading="lazy" src={imgSrc} />
        </Link>
    );
}

export default Item;
