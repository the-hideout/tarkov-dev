const calculateFee = require('./flea-market-fee');

const formatPrice = (price) => {
    return new Intl.NumberFormat().format(price);
};

module.exports = (itemData) => {
    let currentFee = calculateFee(itemData);
    let bestProfit = itemData.avg24hPrice - currentFee;
    let bestPrice = itemData.avg24hPrice;
    let bestPriceFee = currentFee;
    for(let i = itemData.avg24hPrice - 100; i > 0; i = i - 100){
        const itemCopy = {
            avg24hPrice: i,
            basePrice: itemData.basePrice,
        };

        const newFee = calculateFee(itemCopy);

        const newProfit = i - newFee;

        if(newProfit <= bestProfit){
            break;
        }

        bestPrice = i;
        bestProfit = newProfit;
        bestPriceFee = newFee;
    }

    if(bestPrice !== itemData.avg24hPrice){
        console.log(`new best profit for ${itemData.name}: ${formatPrice(bestProfit)} at ${formatPrice(bestPrice)} instead of ${formatPrice(itemData.avg24hPrice - currentFee)} at ${formatPrice(itemData.avg24hPrice)}`);
    }

    return {
        bestPrice: bestPrice,
        bestPriceFee: bestPriceFee,
    };
};
