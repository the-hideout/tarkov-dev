export function isAnyDogtag(id) {
    return id === "59f32bb586f774757e1e8442" || id === "59f32c3b86f77472a31742f0" || id === "customdogtags12345678910";
}

export function isBothDogtags(id) {
    return id === "customdogtags12345678910";
}

export function getDogTagCost(requiredItem, settings = { minDogtagLevel: 1 }) {
    const minLevel = requiredItem.attributes.find((att) => att.name === "minLevel").value;
    const itemName = `${requiredItem.item.name} ≥ ${minLevel}`;
    const sellForBest = requiredItem.item.sellForBest;

    let levelForPrice = parseInt(minLevel);
    if (levelForPrice < parseInt(settings.minDogtagLevel)) {
        levelForPrice = parseInt(settings.minDogtagLevel);
    }
    return {
        name: itemName,
        price: sellForBest?.priceRUB * levelForPrice,
        sourceName: sellForBest?.vendor.name,
        sourceNormalizedName: sellForBest?.vendor.normalizedName,
    };
}

/*export default {
    isAnyDogtag, isBothDogtags
};*/
