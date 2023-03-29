import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import equal from 'fast-deep-equal';

import doFetchHideout from './do-fetch-hideout';

import { langCode } from '../../modules/lang-helpers';
import { placeholderHideout } from '../../modules/placeholder-data';

const initialState = {
    hideout: placeholderHideout(langCode()),
    status: 'idle',
    error: null,
};

export const fetchHideout = createAsyncThunk('hideout/fetchHideout', async () =>
    doFetchHideout(langCode()),
);

const hideoutSlice = createSlice({
    name: 'hideout',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchHideout.pending, (state, action) => {
            state.status = 'loading';
        });
        builder.addCase(fetchHideout.fulfilled, (state, action) => {
            state.status = 'succeeded';

            if (!equal(state.hideout, action.payload)) {
                state.hideout = action.payload;
            }
        });
        builder.addCase(fetchHideout.rejected, (state, action) => {
            state.status = 'failed';
            console.log(action.error);
            state.error = action.payload;
        });
    },
});

export default hideoutSlice.reducer;

export const selectAllHideoutModules = (state) => {
    return state.hideout.hideout;
};
