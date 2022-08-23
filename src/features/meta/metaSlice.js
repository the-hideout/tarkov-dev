import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import equal from 'fast-deep-equal';

import doFetchMeta from './do-fetch-meta';

const initialState = {
    meta: [],
    status: 'idle',
    error: null,
};

export const fetchMeta = createAsyncThunk('meta/fetchMeta', () =>
    doFetchMeta(),
);
const metaSlice = createSlice({
    name: 'meta',
    initialState,
    reducers: {},
    extraReducers: {
        [fetchMeta.pending]: (state, action) => {
            state.status = 'loading';
        },
        [fetchMeta.fulfilled]: (state, action) => {
            state.status = 'succeeded';

            if (!equal(state.meta, action.payload)) {
                state.meta = action.payload;
            }
        },
        [fetchMeta.rejected]: (state, action) => {
            state.status = 'failed';
            console.log(action.error);
            state.error = action.payload;
        },
    },
});

export default metaSlice.reducer;

export const selectMeta = (state) => state.meta.meta;
