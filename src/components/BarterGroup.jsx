import React from 'react';

import BarterItem from './BarterItem';

const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumSignificantDigits: 5,
    }).format(price);
}

function BarterGroup(props) {        
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
                    {`${formatPrice(props.items[props.items.length - 1].pricePerSlot)} - ${formatPrice(props.items[0].pricePerSlot)}` }        
                    <div className="note">
                        per slot
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
                        rotate = {item.rotate}
                        slots = {item.slots}
                        src = {item.img}
                    />
                )} 
            </div>
        </div>
}

export default BarterGroup;


