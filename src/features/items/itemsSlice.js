import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import equal from 'fast-deep-equal';

import calculateFee from '../../modules/flea-market-fee';
import bestPrice from '../../modules/best-price';
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

        return {
            ...rawItem,
            fee: calculateFee(rawItem.avg24hPrice, rawItem.basePrice),
            fallbackImageLink: `${ process.env.PUBLIC_URL }/images/unknown-item-icon.jpg`,
            slots: rawItem.width * rawItem.height,
            // iconLink: `https://assets.tarkov-tools.com/${rawItem.id}-icon.jpg`,
            iconLink: rawItem.iconLink,
            ...bestPrice(rawItem),
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
