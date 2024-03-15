function ItemIcon(props) {
    let sellTo = props.sellTo;
    let sellToNormalized = props.sellToNormalized;
    let count = props.count;
    let sell;

    if (sellToNormalized) {
        sell = (
            <img
                alt={sellTo}
                loading="lazy"
                src={`${process.env.PUBLIC_URL}/images/traders/${sellToNormalized}-icon.jpg`}
                title={sellTo}
            />
        );
    } else {
        sell = count;
    }

    return <span className={'sell-to-icon'}>{sell}</span>;
}

export default ItemIcon;
