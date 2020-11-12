import BarterItem from './BarterItem';

const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumSignificantDigits: 6,
    }).format(price);
};

function BarterGroup(props) {
    let minPrice = false;
    let maxPrice = false;

    for(const item of props.items){
        if(!minPrice || item.pricePerSlot < minPrice){
            minPrice = item.pricePerSlot;
        }

        if(!maxPrice || item.pricePerSlot > maxPrice){
            maxPrice = item.pricePerSlot;
        }
    }

    return <div
            className="barter-group-wrapper"
        >
            <div
                className = "barter-group-title"
            >
                <div
                    className = "barter-class-wrapper"
                >
                    {props.name}
                </div>
                <div
                    className = "price-range-wrapper"
                >
                    {`${formatPrice(minPrice)} - ${formatPrice(maxPrice)}` }
                    <div className="note">
                        per slot
                    </div>
                </div>
            </div>
            <div
                className = "barter-group-items"
            >
                {props.items.filter(item => item.name.toLowerCase().indexOf(props.filter) > -1 || item.shortName?.toLowerCase().indexOf(props.filter) > -1 ).map(item =>
                    <BarterItem
                        key = {item.name}
                        name = {item.name}
                        pricePerSlot = {item.pricePerSlot}
                        rotate = {item.rotate}
                        sellTo = {item.sellTo}
                        slots = {item.slots}
                        src = {item.img}
                        wikiLink = {item.wikiLink}
                    />
                )}
            </div>
        </div>
}

export default BarterGroup;


