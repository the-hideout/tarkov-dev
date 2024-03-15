import { isAnyDogtag, getDogTagCost } from "./dogtags.js";

const fuelIds = [
    '5d1b371186f774253763a656', // Expeditionary fuel tank
    '5d1b36a186f7742523398433', // Metal fuel tank
];

function getCheapestCashPrice(item, settings = {}, allowAllSources = false) {
    let buySource = item.buyFor?.filter(buyFor => {
        if (buyFor.priceRUB === 0) {
            return false;
        }
        if (buyFor.vendor.normalizedName === 'flea-market') {
            return (allowAllSources || settings.hasFlea);
        }
        if (!allowAllSources && settings[buyFor.vendor.normalizedName] < buyFor.vendor.minTraderLevel) {
            return false;
        }
        if (!allowAllSources && settings.useTarkovTracker && buyFor.vendor.taskUnlock && !settings.completedQuests.includes(buyFor.vendor.taskUnlock.id)) {
            return false;
        }
        return true;
    });
    if (!buySource || buySource.length === 0) {
        let sellToTrader = item.sellFor.filter(sellFor => {
            if (sellFor.vendor.normalizedName === 'flea-market') return false;
            if (!allowAllSources && sellFor.vendor.normalizedName === 'jaeger' && !settings.jaeger) return false;
            return true;
        });
        if (sellToTrader.length > 1) {
            sellToTrader = sellToTrader.reduce((prev, current) => {
                return prev.priceRUB > current.priceRUB ? prev : current;
            }, {priceRUB: 0});
        } else {
            sellToTrader = sellToTrader[0];
        }
        return {...sellToTrader, type: 'cash-sell', pricePerUnit: sellToTrader?.priceRUB};
    } else {
        if (buySource.length > 1) {
            buySource = buySource.reduce((prev, current) => {
                return prev.priceRUB < current.priceRUB ? prev : current;
            });
        } else {
            buySource = buySource[0];
        }
        return {...buySource, type: 'cash', pricePerUnit: buySource.priceRUB};
    }
}

function getItemBarters(item, barters, settings, allowAllSources) {
    if (!barters) {
        return [];
    }
    const matchedBarters = [];
    for (const barter of barters) {
        // if(barter.rewardItems.length > 1){
        //     continue;
        // }

        // if(barter.requiredItems.length > 1){
        //     continue;
        // }

        if (barter.rewardItems[0].item.id !== item.id) {
            continue;
        }

        if (!allowAllSources && settings[barter.trader.normalizedName] < barter.level) {
            continue;
        }

        if (!allowAllSources && barter.taskUnlock && settings.useTarkovTracker && !settings.completedQuests.includes[barter.taskUnlock?.id]) {
            continue;
        }

        matchedBarters.push(barter);
    }

    return matchedBarters;
}

function getCheapestBarter(item, {barters = [], crafts = [], settings = false, allowAllSources = false, useBarterIngredients = false, useCraftIngredients = false, itemChain = []}) {
    if (!settings) {
        settings = {};
        allowAllSources = true;
    }
    if (!itemChain || !Array.isArray(itemChain)) {
        itemChain = [];
    }
    itemChain = [
        ...itemChain,
        item.id,
    ];
    const itemBarters = getItemBarters(item, barters, settings, allowAllSources);
    const bestPrice = itemBarters.reduce((bestBarter, barter) => {
        const thisBarterCost = barter.requiredItems.reduce(
            (accumulatedPrice, requiredItem) => {
                let price = !itemChain.includes(requiredItem.item.id) ? 
                    getCheapestPrice(requiredItem.item, {barters, crafts, settings, allowAllSources, useBarterIngredients, useCraftIngredients, itemChain}).pricePerUnit :
                    getCheapestCashPrice(requiredItem.item, settings, allowAllSources).priceRUB;
                if (isAnyDogtag(requiredItem.item.id)) {
                    if (settings.hideDogtagBarters) {
                        return 0;
                    }
                    const dogtagCost = getDogTagCost(requiredItem, settings);
                    price = dogtagCost.price;
                }
                return accumulatedPrice + (price * requiredItem.count);
            },
            0,
        );
        const thisPricePerUnit = Math.round(thisBarterCost / barter.rewardItems[0].count);
        if (thisPricePerUnit && thisPricePerUnit < bestBarter.price) {
            bestBarter.barter = barter;
            bestBarter.price = thisBarterCost;
            bestBarter.pricePerUnit = thisPricePerUnit;
            bestBarter.count = barter.rewardItems[0].count;
            bestBarter.vendor = {
                name: barter.trader.name,
                normalizedName: barter.trader.normalizedName,
                trader: barter.trader,
                minTraderLevel: barter.level,
                taskUnlock: barter.taskUnlock
            };
        }
        return bestBarter;
    }, {
        price: Number.MAX_SAFE_INTEGER,
        type: 'barter',
    });

    if (!bestPrice.barter) {
        return undefined;
    }
    bestPrice.priceRUB = bestPrice.price;
    return bestPrice;
}

function getItemCrafts(item, crafts, settings, allowAllSources) {
    if (!crafts) {
        return [];
    }
    return crafts.reduce((matchedCrafts, craft) => {
        if (craft.rewardItems[0].item.id !== item.id) {
            return matchedCrafts;
        }

        if (!allowAllSources && settings[craft.station.normalizedName] < craft.level) {
            return matchedCrafts;
        }

        if (!allowAllSources && craft.taskUnlock && settings.useTarkovTracker && !settings.completedQuests.includes[craft.taskUnlock.id]) {
            return matchedCrafts;
        }

        matchedCrafts.push(craft);
        return matchedCrafts;
    }, []);
}

function getCheapestCraft(item, {barters = [], crafts = [], settings = false, allowAllSources = false, useBarterIngredients = false, useCraftIngredients = false, itemChain = []}) {
    if (!settings) {
        settings = {};
        allowAllSources = true;
    }
    if (!itemChain || !Array.isArray(itemChain)) {
        itemChain = [];
    }
    itemChain = [
        ...itemChain,
        item.id,
    ];
    const itemCrafts = getItemCrafts(item, crafts, settings, allowAllSources);
    const bestPrice = itemCrafts.reduce((bestCraft, craft) => {
        const thisCraftCost = craft.requiredItems.reduce(
            (accumulatedPrice, requiredItem) => {
                if (requiredItem.attributes.some(att => att.type === 'tool')) {
                    return accumulatedPrice;
                }
                let price = !itemChain.includes(requiredItem.item.id) ? 
                    getCheapestPrice(requiredItem.item, {barters, crafts, settings, allowAllSources, useBarterIngredients, useCraftIngredients, itemChain}).pricePerUnit : 
                    getCheapestCashPrice(requiredItem.item, settings, allowAllSources).priceRUB;
                if (isAnyDogtag(requiredItem.item.id)) {
                    if (settings.hideDogtagBarters) {
                        return 0;
                    }
                    const dogtagCost = getDogTagCost(requiredItem, settings);
                    price = dogtagCost.price;
                }
                return accumulatedPrice + (price * requiredItem.count);
            },
            0,
        );
        const thisPricePerUnit = Math.round(thisCraftCost / craft.rewardItems[0].count);
        if (thisPricePerUnit && thisPricePerUnit < bestCraft.price) {
            bestCraft.craft = craft;
            bestCraft.price = thisCraftCost;
            bestCraft.count = craft.rewardItems[0].count;
            bestCraft.pricePerUnit = thisPricePerUnit;
        }
        return bestCraft;
    }, {
        price: Number.MAX_SAFE_INTEGER,
        type: 'craft',
    });

    if (!bestPrice.craft) {
        return undefined;
    }
    bestPrice.priceRUB = bestPrice.price;
    return bestPrice;
}

function getCheapestPrice(item, {barters = [], crafts = [], settings = false, allowAllSources = false, useBarterIngredients = false, useCraftIngredients = false, itemChain = []}) {
    if (!settings) {
        allowAllSources = true;
        settings = {};
    }
    let bestPrice = getCheapestCashPrice(item, settings, allowAllSources);
    let bestBarter = false;
    if (useBarterIngredients || itemChain.length === 0) {
        bestBarter = getCheapestBarter(item, {barters, crafts, settings, allowAllSources, useBarterIngredients, useCraftIngredients, itemChain});
    }
    let bestCraft = false;
    if (useCraftIngredients || itemChain.length === 0) {
        bestCraft = getCheapestCraft(item, {barters, crafts, settings, allowAllSources, useBarterIngredients, useCraftIngredients, itemChain});
    }
    if (!bestPrice || (bestPrice.type === 'cash-sell' && bestBarter) || bestPrice.pricePerUnit > bestBarter?.pricePerUnit) {
        bestPrice = bestBarter;
    }

    if (!bestPrice || (bestPrice.type === 'cash-sell' && bestCraft) || bestPrice.pricePerUnit > bestCraft?.pricePerUnit) {
        bestPrice = bestCraft;
    }

    return bestPrice;
}

const formatCostItems = (itemsList = [], {
    settings = false,
    barters = [],
    crafts = [],
    freeFuel = false,
    allowAllSources = false,
    useBarterIngredients,
    useCraftIngredients,
}) => {
    if (!settings) {
        settings = {};
        allowAllSources = true;
    }
    if (barters && typeof useBarterIngredients === 'undefined') {
        useBarterIngredients = true;
    }
    if (crafts && typeof useCraftIngredients === 'undefined') {
        useCraftIngredients = true;
    }
    const hideoutManagementSkillLevel = settings['hideout-management'];
    return itemsList.map((requiredItem) => {
        let bestPrice = getCheapestPrice(requiredItem.item, {
            barters,
            crafts,
            settings,
            allowAllSources,
            useBarterIngredients,
            useCraftIngredients,
        }); 

        if (requiredItem.item.priceCustom) {
            bestPrice.price = requiredItem.priceCustom;
            bestPrice.priceRUB = requiredItem.item.priceCustom;
            bestPrice.pricePerUnit = requiredItem.item.priceCustom;
            bestPrice.type = 'custom';
        }
        let calculationPrice = bestPrice.pricePerUnit;

        let itemName = requiredItem.item.name;
        if (isAnyDogtag(requiredItem.item.id)) {
            const dogtagCost = getDogTagCost(requiredItem, settings);
            itemName = dogtagCost.name;
            calculationPrice = dogtagCost.price;
        }

        if (freeFuel && fuelIds.includes(requiredItem.item.id)) {
            bestPrice = requiredItem.item.sellForTradersBest;
            calculationPrice = requiredItem.item.sellForTradersBest.priceRUB * 0.1;
        }

        const isTool = requiredItem.attributes?.some(att => att.name === 'tool' && Boolean(att.value));
        let nonFunctional = false;
        if (requiredItem.item?.types.includes('gun')) {
            nonFunctional = !requiredItem.attributes?.some(att => att.name === 'functional' && Boolean(att.value))
        }

        const returnData = {
            item: requiredItem.item,
            attributes: requiredItem.attributes,
            id: requiredItem.item.id,
            count: requiredItem.count === 0.66
                    ? (requiredItem.count - (requiredItem.count * (hideoutManagementSkillLevel * 0.5)) / 100).toFixed(2)
                    : requiredItem.count,
            name: itemName,
            price: calculationPrice,
            priceRUB: calculationPrice,
            pricePerUnit: calculationPrice,
            priceType: requiredItem.item.cached ? 'cached' : bestPrice.type,
            vendor: bestPrice.vendor,
            priceDetails: bestPrice.barter || bestPrice.craft,
            iconLink: requiredItem.item.iconLink || `${process.env.PUBLIC_URL}/images/unknown-item-icon.jpg`,
            wikiLink: requiredItem.item.wikiLink,
            itemLink: `/item/${requiredItem.item.normalizedName}`,
            isTool: isTool,
            nonFunctional,
            cached: requiredItem.item.cached,
        };

        return returnData;
    });
};

export { formatCostItems, getItemBarters, getCheapestCashPrice, getCheapestBarter, getItemCrafts, getCheapestCraft, getCheapestPrice };

export default formatCostItems;
