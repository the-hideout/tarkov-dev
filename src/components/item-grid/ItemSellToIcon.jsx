function BarterItemSellToIcon(props) {
    if(!props.sellTo){
        return false;
    }

    return <span
        className = {'sell-to-icon'}
    >
        {props.sellTo.substring(0, 2).toUpperCase()}
    </span>
};

export default BarterItemSellToIcon;
