import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import equal from 'fast-deep-equal';

import doFetchItems from './do-fetch-items';
import { langCode } from '../../modules/lang-helpers';

const initialState = {
    items: [],
    status: 'idle',
    error: null,
};

export const fetchItems = createAsyncThunk('items/fetchItems', () =>
    doFetchItems(langCode()),
);
const itemsSlice = createSlice({
    name: 'items',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchItems.pending, (state, action) => {
            state.status = 'loading';
        });
        builder.addCase(fetchItems.fulfilled, (state, action) => {
            state.status = 'succeeded';

            if (!equal(state.items, action.payload)) {
                state.items = action.payload;
            }
        });
        builder.addCase(fetchItems.rejected, (state, action) => {
            state.status = 'failed';
            console.log(action.error);
            state.error = action.payload;
        });
    },
});

export default itemsSlice.reducer;

export const selectAllItems = (state) => state.items.items;
