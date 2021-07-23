const fuelIds = [
    '5d1b371186f774253763a656', // Expeditionary fuel tank
    '5d1b36a186f7742523398433', // Metal fuel tank
];

const priceToUse = 'lastLowPrice';

function getAlternatePriceSource(item, barters) {
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

module.exports = (itemsList, barters, freeFuel = false) => {
    return itemsList.map(requiredItem => {
        let priceSource = 'flea';
        let calculationPrice = requiredItem.item[priceToUse];

        if(!calculationPrice){
            calculationPrice = Math.max(...requiredItem.item.traderPrices.map(priceObject => priceObject.price));
            priceSource = 'trader';
        }

        const alternatePriceSource = getAlternatePriceSource(requiredItem.item, barters);
        let alternatePrice = 0;

        if(alternatePriceSource){
            alternatePrice = alternatePriceSource.requiredItems[0].item[priceToUse];
        }

        if(alternatePrice && alternatePrice < calculationPrice){
            calculationPrice = alternatePrice;
            priceSource = 'barter';
        }

        if(freeFuel && fuelIds.includes(requiredItem.item.id)){
            calculationPrice = 0;
        }

        return {
            count: requiredItem.count,
            name: requiredItem.item.name,
            price: calculationPrice,
            priceSource: priceSource,
            iconLink: requiredItem.item.iconLink,
            wikiLink: requiredItem.item.wikiLink,
            itemLink: `/item/${requiredItem.item.normalizedName}`,
            alternatePrice: alternatePrice,
            alternatePriceSource: alternatePriceSource,
        };
    });
};