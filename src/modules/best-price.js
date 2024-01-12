import calculateFee from './flea-market-fee.mjs';

export default function bestPrice(itemData, Ti = false, Tr = false, startPrice) {
    if (!itemData.basePrice) {
        return {
            bestPrice: 0,
            bestPriceFee: 0,
        };
    }
    let testPrice = startPrice || itemData.lastLowPrice || (itemData.basePrice * 100);
    let currentFee = calculateFee(itemData.basePrice, testPrice, 1, Ti, Tr);
    let bestProfit = testPrice - currentFee;
    let bestPrice = testPrice;
    let bestPriceFee = currentFee;

    for (let i = testPrice - 1000; i > 0; i = i - 1000) {
        const newFee = calculateFee(itemData.basePrice, i, 1, Ti, Tr);

        const newProfit = i - newFee;

        if (newProfit <= bestProfit) {
            break;
        }

        bestPrice = i;
        bestProfit = newProfit;
        bestPriceFee = newFee;
    }

    return {
        bestPrice: bestPrice,
        bestPriceFee: bestPriceFee,
    };
};
