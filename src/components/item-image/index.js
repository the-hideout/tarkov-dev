import './index.css';

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

    if (item.image512pxLink.includes('unknown-item') && !item.gridImageLink.includes('unknown-item')) {
        return (<img src={item.gridImageLink} alt={item.name}/>);
    }

    let height = 200;
    const itemWidth = item.properties?.defaultWidth || item.width;
    const itemHeight = item.properties?.defaultHeight || item.height;
    if (itemWidth > itemHeight) {
        height = itemHeight * 86;
        if (height > 200) {
            height = 200;
        }
    }

    const color = colors[item.backgroundColor];

    const backgroundStyle = {
        backgroundColor: color[1],
        backgroundImage: `url('data:image/svg+xml,\
            <svg xmlns="http://www.w3.org/2000/svg" width="4" height="4" fill-opacity=".25" >\
                <rect x="2" width="2" height="2" />\
                <rect y="2" width="2" height="2" />\
            </svg>')`,
        backgroundSize: '2px 2px',
        position: 'relative',
        height: `${height}px`,
    };

    if (item.types.includes('loading')) {
        const loadingStyle = {
            WebkitMask:`url(${item.image512pxLink}) center/cover`,
                  mask:`url(${item.image512pxLink}) center/cover`,
        };
        
        return (
            <div style={backgroundStyle}>
                <div className="item-image-mask" style={loadingStyle}></div>
            </div>
        )
    }

    return (
        <div style={backgroundStyle}>
            <img src={item.image512pxLink} alt={item.name}/>
            <div className='item-image-text'>{item.shortName}</div>
        </div>
    );
}

export default ItemImage;
