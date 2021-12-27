import getRublePrice from './get-ruble-price';

const fuelIds = [
    '5d1b371186f774253763a656', // Expeditionary fuel tank
    '5d1b36a186f7742523398433', // Metal fuel tank
];

const priceToUse = 'lastLowPrice';

function getBarterPrice(item, barters) {
    for(const barter of barters){
        if(barter.rewardItems.length > 1){
            continue;
        }

        if(barter.requiredItems.length > 1){
            continue;
        }

        if(barter.rewardItems[0].item.id !== item.id){
            continue;
        }

        return barter;
    }

    return false;
};

function getCheapestItemPrice(item, barters, useFlea = true) {
    let bestPrice = {};

    // if(useFlea && item[priceToUse] > 0){
    //     bestPrice.source = 'fleaMarket';
    //     bestPrice.price = item[priceToUse];
    // }

    if(!item.buyFor){
        console.log(item);

        return bestPrice;
    }

    item.buyFor.map((priceObject) => {
        const rublePrice = getRublePrice(priceObject.price, priceObject.currency);

        if(rublePrice > bestPrice.price){
            return true;
        }

        if(priceObject.source === 'fleaMarket' && !useFlea){
            return true;
        }

        bestPrice.source = priceObject.source;
        bestPrice.price = rublePrice;

        return true;
    });

    const barter = getBarterPrice(item, barters);

    if(barter && barter.requiredItems[0].item[priceToUse] < bestPrice.price){
        bestPrice.price = barter.requiredItems[0].item[priceToUse] * barter.requiredItems[0].count;
        bestPrice.source = 'barter';
        bestPrice.barter = barter;
    }

    // If we don't have any price at all, fall back to highest trader sell price
    if(!bestPrice.price){
        item.sellFor.map((priceObject) => {
            const rublePrice = getRublePrice(priceObject.price, priceObject.currency);

            if(rublePrice < bestPrice.price){
                return true;
            }

            if(priceObject.source === 'fleaMarket' && !useFlea){
                return true;
            }

            bestPrice.source = priceObject.source;
            bestPrice.price = rublePrice;

            return true;
        });
    }

    return bestPrice;
};

const formatCostItems = (itemsList, hidMan, barters, freeFuel = false, useFlea = true) => {
    return itemsList.map(requiredItem => {
        let bestPrice = getCheapestItemPrice(requiredItem.item, barters, useFlea);
        let calculationPrice = bestPrice.price;

        if(freeFuel && fuelIds.includes(requiredItem.item.id)){
            calculationPrice = 0;
        }

        return {
            id: requiredItem.item.id,
            count: requiredItem.count === 0.66 ? (requiredItem.count - (requiredItem.count *(hidMan*0.5)/100)).toFixed(2) : requiredItem.count,
            name: requiredItem.item.name,
            price: calculationPrice,
            priceSource: bestPrice.source,
            alternatePriceSource: bestPrice.barter,
            iconLink: requiredItem.item.iconLink || 'https://tarkov-tools.com/images/unknown-item-icon.jpg',
            wikiLink: requiredItem.item.wikiLink,
            itemLink: `/item/${requiredItem.item.normalizedName}`,
        };
    });
};

export default formatCostItems;