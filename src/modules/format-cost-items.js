import { isAnyDogtag, getDogTagCost } from "./dogtags";

const fuelIds = [
    '5d1b371186f774253763a656', // Expeditionary fuel tank
    '5d1b36a186f7742523398433', // Metal fuel tank
];

function getCheapestItemPrice(item, settings, allowAllSources) {
    let buySource = item.buyFor?.filter(buyFor => {
        if (buyFor.priceRUB === 0) {
            return false;
        }
        if (buyFor.vendor.normalizedName === 'flea-market') {
            return (allowAllSources || settings.hasFlea);
        }
        return (allowAllSources || settings[buyFor.vendor.normalizedName] >= buyFor.vendor.minTraderLevel)
    });
    if (!buySource || buySource.length === 0) {
        let sellToTrader = item.sellFor.filter(sellFor => {
            if (sellFor.vendor.normalizedName === 'flea-market') return false;
            if (sellFor.vendor.normalizedName === 'jaeger' && !settings.jaeger) return false;
            return true;
        });
        if (sellToTrader.length > 1) {
            sellToTrader = sellToTrader.reduce((prev, current) => {
                return prev.priceRUB > current.priceRUB ? prev : current;
            });
        } else {
            sellToTrader = sellToTrader[0];
        }
        return {...sellToTrader, type: 'cash-sell'};
    } else {
        if (buySource.length > 1) {
            buySource = buySource.reduce((prev, current) => {
                return prev.priceRUB < current.priceRUB ? prev : current;
            });
        } else {
            buySource = buySource[0];
        }
        return {...buySource, type: 'cash'};
    }
}

function getItemBarters(item, barters, settings, allowAllSources) {
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

        matchedBarters.push(barter);
    }

    return matchedBarters;
}

function getCheapestBarter(item, barters, settings, allowAllSources) {
    const itemBarters = getItemBarters(item, barters, settings, allowAllSources);
    let bestBarter = false;
    let barterTotalCost = Number.MAX_SAFE_INTEGER;
    let bestPrice = {};

    for (const barter of itemBarters) {
        const thisBarterCost = barter.requiredItems.reduce(
            (accumulatedPrice, requiredItem) => {
                let price = getCheapestItemPrice(requiredItem.item, settings, allowAllSources).priceRUB;
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
        if (thisBarterCost && thisBarterCost < barterTotalCost) {
            bestBarter = barter;
            barterTotalCost = thisBarterCost;
        }
    }

    if (bestBarter) {
        bestPrice.price = barterTotalCost;
        bestPrice.priceRUB = barterTotalCost;
        bestPrice.type = 'barter';
        bestPrice.barter = bestBarter;
    } else {
        bestPrice = undefined;
    }

    return bestPrice;
}

function getCheapestItemPriceWithBarters(item, barters, settings, allowAllSources) {
    const useFlea = settings.useFlea;
    const bestPrice = getCheapestItemPrice(item, settings, allowAllSources);

    const itemBarters = getItemBarters(item, barters, settings, allowAllSources);
    let bestBarter = false;
    let barterTotalCost = Number.MAX_SAFE_INTEGER;

    for (const barter of itemBarters) {
        const thisBarterCost = barter.requiredItems.reduce(
            (accumulatedPrice, requiredItem) => {
                let price = getCheapestItemPrice(requiredItem.item, settings, allowAllSources).priceRUB;
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
        if (thisBarterCost && thisBarterCost < barterTotalCost) {
            bestBarter = barter;
            barterTotalCost = thisBarterCost;
        }
    }
 
    if (bestBarter && (!bestPrice.price || barterTotalCost < bestPrice.price || bestPrice.type === 'cash-sell')) {
        bestPrice.price = barterTotalCost;
        bestPrice.priceRUB = barterTotalCost;
        bestPrice.type = 'barter';
        bestPrice.barter = bestBarter;
        bestPrice.vendor = {
            name: bestBarter.trader.name,
            normalizedName: bestBarter.trader.normalizedName,
            trader: bestBarter.trader,
            minTraderLevel: bestBarter.level,
            taskUnlock: bestBarter.taskUnlock
        }
    }

    // If we don't have any price at all, fall back to highest trader sell price
    if (!bestPrice.price) {
        // console.log(`Found no bestPrice for ${item.name}, falling back to trader value`);
        item.sellFor.forEach((priceObject) => {
            if (priceObject.priceRUB < bestPrice.price) {
                return;
            }

            if (priceObject.vendor.normalizedName === 'flea-market' && !useFlea) {
                return;
            }

            bestPrice.type = 'cash';
            bestPrice.vendor = priceObject.vendor;
            bestPrice.price = priceObject.priceRUB;

            return;
        });
    }

    return bestPrice;
}

const formatCostItems = (
    itemsList,
    settings,
    barters,
    freeFuel = false,
    allowAllSources = false
) => {
    const hideoutManagementSkillLevel = settings['hideout-management'];
    return itemsList.map((requiredItem) => {
        let bestPrice = getCheapestItemPriceWithBarters(
            requiredItem.item,
            barters,
            settings,
            allowAllSources
        );
        if (requiredItem.priceCustom) {
            bestPrice.priceRUB = requiredItem.priceCustom;
            bestPrice.type = 'custom';
        }
        let calculationPrice = bestPrice.priceRUB;

        let itemName = requiredItem.item.name;
        if (isAnyDogtag(requiredItem.item.id)) {
            const dogtagCost = getDogTagCost(requiredItem, settings);
            itemName = dogtagCost.name;
            calculationPrice = dogtagCost.price;
        }

        if (freeFuel && fuelIds.includes(requiredItem.item.id)) {
            calculationPrice = 0;
        }

        const isTool = requiredItem.attributes?.some(element => element.type === 'tool');
        let nonFunctional = false;
        if (requiredItem.item?.types.includes('gun')) {
            nonFunctional = !requiredItem.attributes?.some(element => element.type === 'functional' && Boolean(element.value))
        }

        const returnData = {
            id: requiredItem.item.id,
            count:
                requiredItem.count === 0.66
                    ? (
                          requiredItem.count -
                          (requiredItem.count *
                              (hideoutManagementSkillLevel * 0.5)) /
                              100
                      ).toFixed(2)
                    : requiredItem.count,
            name: itemName,
            price: calculationPrice,
            priceRUB: calculationPrice,
            priceType: requiredItem.item.cached ? 'cached' : bestPrice.type,
            vendor: bestPrice.vendor,
            priceDetails: bestPrice.barter,
            iconLink:
                requiredItem.item.iconLink ||
                `${process.env.PUBLIC_URL}/images/unknown-item-icon.jpg`,
            wikiLink: requiredItem.item.wikiLink,
            itemLink: `/item/${requiredItem.item.normalizedName}`,
            isTool: isTool,
            nonFunctional,
            cached: requiredItem.item.cached,
        };

        return returnData;
    });
};

export { formatCostItems, getItemBarters, getCheapestItemPrice, getCheapestItemPriceWithBarters, getCheapestBarter };

export default formatCostItems;
