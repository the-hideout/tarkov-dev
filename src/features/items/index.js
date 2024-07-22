import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import equal from 'fast-deep-equal';

import doFetchItems from './do-fetch-items.mjs';
import { placeholderItems } from '../../modules/placeholder-data.js';
import { langCode, useLangCode } from '../../modules/lang-helpers.js';

function processFetchedItems(allItems) {

    for (const item of allItems) {

        item.slots = item.width * item.height;

        item.categoryIds = item.categories.map(cat => cat.id);

        if (item.properties)
            item.properties.weight = item.weight;

        if (item.types.includes('gun')) {
            item.containsItems = [];
        }
        else {
            item.containsItems = item.containsItems.filter(contained => contained != null);
        }

        // dummy trader for items that can't be sold or bought
        const noneTrader = {
            price: 0,
            priceRUB: 0,
            currency: 'RUB',
            vendor: {
                name: 'N/A',
                normalizedName: 'unknown',
            },
        }

        // cheapest first
        item.buyFor = item.buyFor.sort((a, b) => {
            return a.priceRUB - b.priceRUB;
        });

        item.buyForBest = item.buyFor[0] || noneTrader;

        const buyForTraders = item.buyFor.filter(buyFor => buyFor.vendor.normalizedName !== 'flea-market');

        item.buyForTradersBest = buyForTraders[0] || noneTrader;

        // most profitable first
        item.sellFor = item.sellFor.sort((a, b) => {
            return b.priceRUB - a.priceRUB;
        });

        item.sellForBest = item.sellFor[0] || noneTrader;

        const sellForTraders = item.sellFor.filter(sellFor => sellFor.vendor.normalizedName !== 'flea-market');

        item.sellForTradersBest = sellForTraders[0] || noneTrader;
    }

    return allItems;
}

const initialState = {
    data: processFetchedItems(placeholderItems(langCode())),
    status: 'idle',
    error: null,
};

export const fetchItems = createAsyncThunk('items/fetchItems', (arg, { getState }) => {
    const state = getState();
    const gameMode = state.settings.gameMode;
    return doFetchItems({language: langCode(), gameMode});
});
const itemsSlice = createSlice({
    name: 'items',
    initialState,
    reducers: {
        setCustomSellValue: (state, action) => {
            const item = state.data.find(i => i.id === action.payload.itemId);
            if (!item) {
                return;
            }
            item.priceCustom = action.payload.price;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchItems.pending, (state, action) => {
            state.status = 'loading';
        });
        builder.addCase(fetchItems.fulfilled, (state, action) => {
            state.status = 'succeeded';
            if (!equal(state.data, action.payload)) {
                state.data = processFetchedItems(action.payload);
            }
        });
        builder.addCase(fetchItems.rejected, (state, action) => {
            state.status = 'failed';
            console.log(action.error);
            state.error = action.payload;
        });
    },
});

export const { setCustomSellValue } = itemsSlice.actions;

export const itemsReducer = itemsSlice.reducer;

export const selectAllItems = (state) => state.items.data;

let fetchedLang = false;
let fetchedGameMode = false;
let refreshInterval = false;

const clearRefreshInterval = () => {
    clearInterval(refreshInterval);
    refreshInterval = false;
};

export default function useItemsData() {
    const dispatch = useDispatch();
    const { data, status, error } = useSelector((state) => state.items);
    const lang = useLangCode();
    const gameMode = useSelector((state) => state.settings.gameMode);

    useEffect(() => {
        if (fetchedLang !== lang || fetchedGameMode !== gameMode) {
            fetchedLang = lang;
            fetchedGameMode = gameMode;
            dispatch(fetchItems());
            clearRefreshInterval();
        }
        if (!refreshInterval) {
            refreshInterval = setInterval(() => {
                dispatch(fetchItems());
            }, 600000);
        }
        return () => {
            clearRefreshInterval();
        };
    }, [dispatch, lang, gameMode]);
    
    return { data, status, error };
};
