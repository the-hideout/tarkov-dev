import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import equal from 'fast-deep-equal';

import { langCode } from '../../modules/lang-helpers';
import doFetchTraders from './do-fetch-traders';

import { placeholderTraders } from '../../modules/placeholder-data';

const initialState = {
    traders: placeholderTraders(langCode()),
    status: 'idle',
    error: null,
};

export const fetchTraders = createAsyncThunk('traders/fetchTraders', () =>
    doFetchTraders(langCode()),
);
const tradersSlice = createSlice({
    name: 'traders',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchTraders.pending, (state, action) => {
            state.status = 'loading';
        });
        builder.addCase(fetchTraders.fulfilled, (state, action) => {
            state.status = 'succeeded';

            if (!equal(state.traders, action.payload)) {
                state.traders = action.payload;
            }
        });
        builder.addCase(fetchTraders.rejected, (state, action) => {
            state.status = 'failed';
            console.log(action.error);
            state.error = action.payload;
        });
    },
});

export default tradersSlice.reducer;

export const selectAllTraders = (state) => state.traders.traders;
