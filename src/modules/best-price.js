import calculateFee from './flea-market-fee';

export default function bestPrice(itemData, Ti = false, Tr = false) {
    let currentFee = calculateFee(itemData.basePrice, itemData.lastLowPrice, 1, Ti, Tr);
    let bestProfit = itemData.lastLowPrice - currentFee;
    let bestPrice = itemData.lastLowPrice;
    let bestPriceFee = currentFee;

    for (let i = itemData.lastLowPrice - 1000; i > 0; i = i - 1000) {
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
