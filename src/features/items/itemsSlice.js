import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import equal from 'fast-deep-equal';

import calculateFee from '../../modules/flea-market-fee';
import camelcaseToDashes from '../../modules/camelcase-to-dashes';
import getRublePrice from '../../modules/get-ruble-price';

const initialState = {
    items: [],
    status: 'idle',
    error: null,
};

const NOTES = {
    '5e4abc6786f77406812bd572': 'Can only keep medical items',
    '60a2828e8689911a226117f9': `Can't store Pillbox, Day Pack, LK 3F or MBSS inside`,
    '5c093e3486f77430cb02e593': 'Dogtags',
    '619cbf9e0a7c3a1a2731940a': 'Keycards',
    '619cbf7d23893217ec30b689': 'Injectors',
    '5aafbde786f774389d0cbc0f': 'Ammounition',
    '59fb023c86f7746d0d4b423c': 'Weapons & mods',
    '5b6d9ce188a4501afc1b2b25': 'Weapons & mods',
    '5c127c4486f7745625356c13': 'Magazines',
    '5e2af55f86f7746d4159f07c': 'Grenades',
    '5aafbcd986f7745e590fff23': 'Meds, injectors & medical barter items',
    '59fb016586f7746d0d4b423a': 'Currency, GP coins, Physical bitcoins',
    '590c60fc86f77412b13fddcf': 'Currency, Diary, Folder with intelligence, GP coin, Keys & Keycards, Maps, Physical bitcoin, SAS drive, Secure Flash drive, Slim diary, SSD drive, Tech manual, Veritas guitar pick',
    '567143bf4bdc2d1a0f8b4567': 'Pistols, pistol magazines & ammunition',
    '5d235bb686f77443f4331278': 'Chain with Prokill medallion, Currency, Dogtag, Gold skull ring, GP coin, Keys & Keycards, Physical bitcoin, Secure Flash drive, Veritas guitar pick',
    '5783c43d2459774bbe137486': 'Currency',
    '60b0f6c058e0b0481a09ad11': 'Currency',
    '5b7c710788a4506dec015957': 'Barter items',
    '59fafd4b86f7745ca07e1232': 'Keys',
};

export const fetchItems = createAsyncThunk('items/fetchItems', async () => {
    const bodyQuery = JSON.stringify({query: `{
            itemsByType(type:any){
                id
                name
                shortName
                basePrice
                normalizedName
                types
                width
                height
                avg24hPrice
                wikiLink
                changeLast48h
                low24hPrice
                high24hPrice
                lastLowPrice
                gridImageLink
                iconLink
                traderPrices {
                    price
                    trader {
                        name
                    }
                }
                sellFor {
                    source
                    price
                    requirements {
                        type
                        value
                    }
                    currency
                }
                buyFor {
                    source
                    price
                    currency
                    requirements {
                        type
                        value
                    }
                }
                containsItems {
                    count
                    item {
                        id
                    }
                }
            }
        }`
    });

    const [itemData, itemGrids, itemProps] = await Promise.all([
        fetch('https://tarkov-tools.com/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: bodyQuery,
        })
            .then(response => response.json()),
        fetch(`${process.env.PUBLIC_URL}/data/item-grids.min.json`)
            .then(response => response.json()),
        fetch(`${process.env.PUBLIC_URL}/data/item-props.min.json`)
            .then(response => response.json()),
    ]);

    const allItems = itemData.data.itemsByType.map((rawItem) => {
        let grid = false;

        rawItem.itemProperties = itemProps[rawItem.id]?.itemProperties || {};
        rawItem.linkedItems = itemProps[rawItem.id]?.linkedItems || {};

        if(itemProps[rawItem.id]?.hasGrid){
            let gridPockets = [{
                row: 0,
                col: 0,
                width: rawItem.itemProperties.grid.pockets[0].width,
                height: rawItem.itemProperties.grid.totalSize / rawItem.itemProperties.grid.pockets[0].width,
            }];

            if(itemGrids[rawItem.id]){
                gridPockets = itemGrids[rawItem.id];
            }

            grid = {
                height: rawItem.itemProperties.grid.totalSize / rawItem.itemProperties.grid.pockets[0].width,
                width: rawItem.itemProperties.grid.pockets[0].width,
                pockets: gridPockets,
            };

            if(gridPockets.length > 1){
                grid.height = Math.max(...gridPockets.map(pocket => pocket.row + pocket.height));
                grid.width = Math.max(...gridPockets.map(pocket => pocket.col + pocket.width));
            }

            // Rigs we haven't configured shouldn't break
            if(!itemGrids[rawItem.id] && !rawItem.types.includes('backpack')){
                grid = false;
            }
        }

        rawItem.buyFor = rawItem.buyFor.sort((a, b) => {
            return getRublePrice(a.price, a.currency) - getRublePrice(b.price, b.currency);
        });

        if(!Array.isArray(rawItem.linkedItems)){
            rawItem.linkedItems = [];
        }

        rawItem.sellFor = rawItem.sellFor.map((sellPrice) => {
            return {
                ...sellPrice,
                source: camelcaseToDashes(sellPrice.source),
            };
        });

        rawItem.buyFor = rawItem.buyFor.map((buyPrice) => {
            return {
                ...buyPrice,
                source: camelcaseToDashes(buyPrice.source),
            };
        });

        // This change is reflected right away
        if(rawItem.types.includes('noFlea')){
            rawItem.sellFor = rawItem.sellFor.filter(sellFor => sellFor.source !== 'flea-market');
            rawItem.buyFor = rawItem.buyFor.filter(buyFor => buyFor.source !== 'flea-market');
        }

        return {
            ...rawItem,
            fee: calculateFee(rawItem.avg24hPrice, rawItem.basePrice),
            fallbackImageLink: `${ process.env.PUBLIC_URL }/images/unknown-item-icon.jpg`,
            slots: rawItem.width * rawItem.height,
            // iconLink: `https://assets.tarkov-tools.com/${rawItem.id}-icon.jpg`,
            iconLink: rawItem.iconLink,
            grid: grid,
            notes: NOTES[rawItem.id],
            traderPrices: rawItem.traderPrices.map(traderPrice => {
                return {
                    price: traderPrice.price,
                    trader: traderPrice.trader.name,
                };
            }),
        };
    });

    const itemMap = {};

    for(const item of allItems){
        itemMap[item.id] = item;
    }

    for(const item of allItems){
        if(item.types.includes('gun') && item.containsItems){
            item.traderPrices = item.traderPrices.map((localTraderPrice) => {
                if(localTraderPrice.source === 'fleaMarket'){
                    return localTraderPrice;
                }

                localTraderPrice.price = item.containsItems.reduce((previousValue, currentValue) => {
                    const partPrice = itemMap[currentValue.item.id].traderPrices.find(innerTraderPrice => innerTraderPrice.name === localTraderPrice.name);

                    if(!partPrice){
                        return previousValue;
                    }

                    return partPrice.price + previousValue;
                }, localTraderPrice.price);

                return localTraderPrice;
            });

            item.sellFor = item.sellFor.map((sellFor) => {
                if(sellFor.source === 'fleaMarket'){
                    return sellFor;
                }

                sellFor.price = item.containsItems.reduce((previousValue, currentValue) => {
                    const partPrice = itemMap[currentValue.item.id].sellFor.find(innerSellFor => innerSellFor.source === sellFor.source);

                    if(!partPrice){
                        return previousValue;
                    }

                    return partPrice.price + previousValue;
                }, sellFor.price);

                return sellFor;
            });
        }

        const bestTraderPrice = item.traderPrices.sort((a, b) => {
            return b.price - a.price;
        }).shift();

        item.traderPrice = bestTraderPrice?.price || 0;
        item.traderName = bestTraderPrice?.trader || '?';
    }

    return allItems;
});

const itemsSlice = createSlice({
    name: 'items',
    initialState,
    reducers: {},
    extraReducers: {
        [fetchItems.pending]: (state, action) => {
            state.status = 'loading';
        },
        [fetchItems.fulfilled]: (state, action) => {
            state.status = 'succeeded';

            if(!equal(state.items, action.payload)){
                state.items = action.payload;
            }
        },
        [fetchItems.rejected]: (state, action) => {
            state.status = 'failed';
            console.log(action.error);
            state.error = action.payload;
        },
    },
});

export default itemsSlice.reducer;

export const selectAllItems = (state) => state.items.items;
