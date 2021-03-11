function ItemIcon(props) {
    if(!props.text){
        return false;
    }

    let parsedText = props.text;
    let sellTo;

    if(typeof parsedText === 'string'){
        if(parsedText.toLowerCase() === 'flea market'){
            if(props.maxLength){
                parsedText = parsedText.substring(0, 2);
            }

            sellTo = parsedText;
        } else {
            sellTo = <img
                alt = {parsedText}
                src = {`${ process.env.PUBLIC_URL }/images/${ parsedText.toLowerCase() }-icon.png`}
                title = {parsedText}
            />;
        }
    } else {
        parsedText = parsedText.toString();
        sellTo = parsedText;
    }

    return <span
        className = {'sell-to-icon'}
    >
        {sellTo}
    </span>
};

export default ItemIcon;
