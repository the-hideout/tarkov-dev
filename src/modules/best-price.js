const calculateFee = require('./flea-market-fee');

module.exports = (itemData) => {
    let currentFee = calculateFee(itemData.avg24hPrice, itemData.basePrice);
    // let bestProfit = itemData.avg24hPrice - currentFee;
    let bestPrice = itemData.avg24hPrice;
    // let bestPriceFee = currentFee;
    // for(let i = itemData.avg24hPrice - 1000; i > 0; i = i - 1000){
    //     const newFee = calculateFee(i, itemData.basePrice);

    //     const newProfit = i - newFee;

    //     if(newProfit <= bestProfit){
    //         break;
    //     }

    //     bestPrice = i;
    //     bestProfit = newProfit;
    //     bestPriceFee = newFee;
    // }

    return {
        bestPrice: bestPrice,
        bestPriceFee: currentFee,
    };
};