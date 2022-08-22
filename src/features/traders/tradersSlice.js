import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import equal from 'fast-deep-equal';

import doFetchTraders from './do-fetch-traders';

const initialState = {
    traders: [],
    status: 'idle',
    error: null,
};

export const fetchTraders = createAsyncThunk('traders/fetchTraders', () =>
    doFetchTraders(),
);
const tradersSlice = createSlice({
    name: 'traders',
    initialState,
    reducers: {},
    extraReducers: {
        [fetchTraders.pending]: (state, action) => {
            state.status = 'loading';
        },
        [fetchTraders.fulfilled]: (state, action) => {
            state.status = 'succeeded';

            if (!equal(state.traders, action.payload)) {
                state.traders = action.payload;
            }
        },
        [fetchTraders.rejected]: (state, action) => {
            state.status = 'failed';
            console.log(action.error);
            state.error = action.payload;
        },
    },
});

export default tradersSlice.reducer;

export const selectAllTraders = (state) => state.traders.traders;
