import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import equal from 'fast-deep-equal';

import doFetchItems from './do-fetch-items.mjs';
import { placeholderItems } from '../../modules/placeholder-data.js';
import { langCode } from '../../modules/lang-helpers.js';

const initialState = {
    data: placeholderItems(langCode()),
    status: 'idle',
    error: null,
};

export const fetchItems = createAsyncThunk('items/fetchItems', () => 
    doFetchItems(langCode())
);
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
                state.data = action.payload;
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

let fetchedData = false;
let refreshInterval = false;

export default function useItemsData() {
    const dispatch = useDispatch();
    const { data, status, error } = useSelector((state) => state.items);

    useEffect(() => {
        if (!fetchedData) {
            fetchedData = true;
            dispatch(fetchItems());
        }
        if (!refreshInterval) {
            refreshInterval = setInterval(() => {
                dispatch(fetchItems());
            }, 600000);
        }
        return () => {
            clearInterval(refreshInterval);
            refreshInterval = false;
        };
    }, [dispatch]);
    
    return { data, status, error };
};
