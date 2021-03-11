function ItemIcon(props) {
    if(!props.text){
        return false;
    }

    let sellTo = <img
        alt = {props.text}
        src = {`${ process.env.PUBLIC_URL }/images/${ props.text.toLowerCase() }-icon.png`}
        title = {props.text}
    />;

    if(props.text.toLowerCase() === 'flea market'){
        let parsedText = props.text;

        if(props.maxLength){
            parsedText = parsedText.substring(0, 2);
        }

        sellTo = parsedText;
    }

    return <span
        className = {'sell-to-icon'}
    >
        {sellTo}
    </span>
};

export default ItemIcon;
