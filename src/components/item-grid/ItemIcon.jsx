function ItemIcon(props) {
    if(!props.text){
        return false;
    }

    let parsedText = props.text;
    let sellTo;

    if(typeof parsedText === 'string'){
        sellTo = <img
            alt = {parsedText}
            src = {`${ process.env.PUBLIC_URL }/images/${ parsedText.replace(/\s/g, '-').toLowerCase() }-icon.jpg`}
            title = {parsedText}
        />;
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
