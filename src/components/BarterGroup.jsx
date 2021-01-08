import BarterItem from './BarterItem';

import formatPrice from '../modules/format-price';

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

    minPrice = Math.floor(minPrice / 1000) * 1000;
    maxPrice = Math.ceil(maxPrice / 1000) * 1000;

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
                    <div>
                        {`${formatPrice(minPrice)} - ${formatPrice(maxPrice)}` }
                        <div className="note">
                            per slot
                        </div>
                    </div>
                </div>
            </div>
            <div
                className = "barter-group-items"
            >
                {props.items.map(item =>
                    <BarterItem
                        key = {item.name}
                        name = {item.name}
                        pricePerSlot = {item.pricePerSlot}
                        horizontal = {item.horizontal}
                        sellTo = {item.sellTo}
                        slots = {item.slots}
                        src = {item.imgLink}
                        wikiLink = {item.wikiLink}
                        height = {item.height}
                        width = {item.width}
                    />
                )}
            </div>
        </div>
}

export default BarterGroup;


