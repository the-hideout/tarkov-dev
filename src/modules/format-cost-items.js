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

        if(barter.rewardItems[0].count !== barter.requiredItems[0].count){
            continue;
        }

        if(barter.rewardItems[0].item.id !== item.id){
            continue;
        }

        return barter;
    }

    return false;
};

function getCheapestItemPrice(item, barters) {
    let bestPrice = {
        source: 'fleaMarket',
        price: item[priceToUse],
    };

    if(!item.buyFor){
        console.log(item);

        return bestPrice;
    }

    item.buyFor.map((priceObject) => {
        const rublePrice = getRublePrice(priceObject.price, priceObject.currency);

        if(rublePrice > bestPrice.price){
            return true;
        }

        bestPrice.source = priceObject.source;
        bestPrice.price = rublePrice;

        return true;
    });

    const barter = getBarterPrice(item, barters);

    if(barter && barter.requiredItems[0].item[priceToUse] < bestPrice.price){
        bestPrice.price = barter.requiredItems[0].item[priceToUse];
        bestPrice.source = 'barter';
        bestPrice.barter = barter;
    }

    return bestPrice;
};

const formatCostItems = (itemsList, barters, freeFuel = false) => {
    return itemsList.map(requiredItem => {
        let bestPrice = getCheapestItemPrice(requiredItem.item, barters);
        let calculationPrice = bestPrice.price;

        if(freeFuel && fuelIds.includes(requiredItem.item.id)){
            calculationPrice = 0;
        }

        return {
            count: requiredItem.count,
            name: requiredItem.item.name,
            price: calculationPrice,
            priceSource: bestPrice.source,
            alternatePriceSource: bestPrice.barter,
            iconLink: requiredItem.item.iconLink,
            wikiLink: requiredItem.item.wikiLink,
            itemLink: `/item/${requiredItem.item.normalizedName}`,
        };
    });
};

export default formatCostItems;