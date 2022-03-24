import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import equal from 'fast-deep-equal';

const initialState = {
    hideout: [],
    status: 'idle',
    error: null,
};

export const fetchHideout = createAsyncThunk(
    'hideout/fetchHideout',
    async () => {
        const bodyQuery = JSON.stringify({
            query: `{
        hideoutModules {
            id
            name
            level
            itemRequirements {
            quantity
                item {
                    name
                    id
                    iconLink
                }
            }
        }
    }`,
        });

        const response = await fetch('https://api.tarkov.dev/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: bodyQuery,
        });

        const hideoutData = await response.json();

        return hideoutData.data.hideoutModules;
    },
);

const hideoutSlice = createSlice({
    name: 'hideout',
    initialState,
    reducers: {},
    extraReducers: {
        [fetchHideout.pending]: (state, action) => {
            state.status = 'loading';
        },
        [fetchHideout.fulfilled]: (state, action) => {
            state.status = 'succeeded';

            if (!equal(state.hideout, action.payload)) {
                state.hideout = action.payload;
            }
        },
        [fetchHideout.rejected]: (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
        },
    },
});

export default hideoutSlice.reducer;

export const selectAllHideoutModules = (state) => {
    return state.hideout.hideout;
};
