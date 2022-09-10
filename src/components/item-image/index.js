const colors = {
    violet: [
        '#271d2a',
        '#2c232f',
    ],
    grey: [
        '#191a1a',
        '#1e1e1e',
    ],
    yellow: [
        '#2f301d',
        '#343421',
    ],
    orange: [
        '#221611',
        '#261d14',
    ],
    green: [
        '#161c11',
        '#1a2314',
    ],
    red: [
        '#311c18',
        '#38221f',
    ],
    default: [
        '#363537',
        '#3a3c3b',
    ],
    black: [
        '#100f11',
        '#141614',
    ],
    blue: [
        '#1d262f',
        '#202d32',
    ],
};

function ItemImage(props) {
    const { item } = props;
    const color = colors[item.backgroundColor];

    const backgroundStyle = {
        backgroundColor: color[1],
        backgroundImage: `url('data:image/svg+xml,\
        <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" fill-opacity=".25" >\
                 <rect x="200" width="200" height="200" />\
                 <rect y="200" width="200" height="200" />\
                 </svg>')`,
        backgroundSize: '2px 2px',
        position: 'relative',
        textAlign: 'center',
    };

    const textStyle = {
        color: '#a4aeb4',
        position: 'absolute',
        top: '2px',
        right: '5px',
    };

    if (item.image512pxLink.includes('unknown-item') && !item.gridImageLink.includes('unknown-item')) {
        return (<img src={item.gridImageLink} alt={item.name}/>);
    }

    return (
        <div style={backgroundStyle}>
            <img src={item.image512pxLink} alt={item.name}/>
            <div style={textStyle}>{item.shortName}</div>
        </div>
    );
}

export default ItemImage;
