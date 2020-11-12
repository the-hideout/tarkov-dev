const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumSignificantDigits: 6,
    }).format(price);
};

function BarterItem(props) {
    const imgClassBase = 'barter-icon-';
    let imgClass;
    switch (props.slots){
        case 2:
            imgClass = `${imgClassBase}1x-2x`;
            break;
        case 3:
            imgClass = `${imgClassBase}1x-3x`;
            break;
        case 4:
            imgClass = `${imgClassBase}2x-2x`;
            break;
        case 6:
            imgClass = `${imgClassBase}2x-3x`;
            break;
        case 8:
            imgClass = `${imgClassBase}2x-4x`;
            break;
        case 9:
            imgClass = `${imgClassBase}2x-2x`;
            break;
        case 1:
        default:
            imgClass = `${imgClassBase}1x-1x`;
    };

    let imgSrc = props.src;

    if(props.rotate){
        imgSrc = `//images.weserv.nl/?url=${encodeURIComponent(imgSrc)}&ro=${props.rotate}}`;
        // imgClass = `${imgClassBase}2x-1x`;
    }

    return <a
        href= {props.wikiLink}
        className = {`barter-item ${imgClass}`}
    >
        <span
            className = {'barter-item-tooltip'}
        >
            <div>Value: {formatPrice(props.pricePerSlot * props.slots)}</div>
            <div>Per slot: {formatPrice(props.pricePerSlot)}</div>
            <div>Sell to: {props.sellTo}</div>
        </span>
        <span
            className = {'sell-to-icon'}
        >
            {props.sellTo.substring(0, 2).toUpperCase()}
        </span>
        <img
            alt = {props.name}
            src = {imgSrc}
        />
    </a>
}

export default BarterItem;


