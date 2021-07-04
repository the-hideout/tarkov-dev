import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import calculateFee from '../../modules/flea-market-fee';
import bestPrice from '../../modules/best-price';

import itemGrids from '../../data/item-grids.json';
import itemProps from '../../data/item-props.json';

const initialState = {
    items: [],
    status: 'idle',
    error: null,
};

const NOTES = {
    '5e4abc6786f77406812bd572': 'Can only keep medical items',
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
                traderPrices {
                    price
                    trader {
                        name
                    }
                }
            }
        }`
    });

    const response = await fetch('https://tarkov-tools.com/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: bodyQuery,
    });

    const itemData = await response.json();

    return itemData.data.itemsByType.map((rawItem) => {
        let grid = false;

        rawItem.itemProperties = itemProps[rawItem.id]?.itemProperties || {};
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

        const bestTraderPrice = rawItem.traderPrices.sort((a, b) => {
            if(a.price > b.price) {
                return -1;
            }

            if(a.price < b.price) {
                return 1;
            }

            return 0;
        }).shift();


        if(!Array.isArray(rawItem.linkedItems)){
            rawItem.linkedItems = [];
        }

        return {
            ...rawItem,
            fee: calculateFee(rawItem.avg24hPrice, rawItem.basePrice),
            imgLink: `https://assets.tarkov-tools.com/${rawItem.id}-grid-image.jpg`,
            slots: rawItem.width * rawItem.height,
            traderPrice: bestTraderPrice?.price || 0,
            traderName: bestTraderPrice?.trader?.name || '?',
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
            // Add any fetched items to the array
            state.items = state.items.concat(action.payload)
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
