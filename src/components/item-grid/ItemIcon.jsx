function ItemIcon(props) {
    if(!props.text){
        return false;
    }

    let parsedText = props.text;
    if(props.maxLength){
        parsedText = parsedText.substring(0, 2);
    }

    return <span
        className = {'sell-to-icon'}
    >
        {parsedText}
    </span>
};

export default ItemIcon;
