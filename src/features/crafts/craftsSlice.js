import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import equal from 'fast-deep-equal';

import doFetchCrafts from './do-fetch-crafts';
import { langCode } from '../../modules/lang-helpers';

import { placeholderCrafts } from '../../modules/placeholder-data';

const initialState = {
    crafts: placeholderCrafts(langCode()),
    status: 'idle',
    error: null,
};

export const fetchCrafts = createAsyncThunk('crafts/fetchCrafts', async () => 
    doFetchCrafts(langCode()),
);

const craftsSlice = createSlice({
    name: 'crafts',
    initialState,
    reducers: {
        toggleItem: (state, action) => {
            let newCrafts = [...state.crafts];

            newCrafts = newCrafts.map((craft) => {
                craft.requiredItems = craft.requiredItems.map(
                    (requiredItem) => {
                        // Filter an item only if it's not a tool
                        const isTool = requiredItem.attributes.some(element => element.type === "tool");
                        if (isTool === true) {
                            return requiredItem;
                        }

                        if (requiredItem.item.id === action.payload.itemId) {
                            if (requiredItem.count === 0) {
                                requiredItem.count = requiredItem.originalCount;
                            } else {
                                requiredItem.originalCount = requiredItem.count;
                                requiredItem.count = 0;
                            }
                        }

                        return requiredItem;
                    },
                );

                return craft;
            });

            state.crafts = newCrafts;
        },
    },
    extraReducers: {
        [fetchCrafts.pending]: (state, action) => {
            state.status = 'loading';
        },
        [fetchCrafts.fulfilled]: (state, action) => {
            state.status = 'succeeded';

            if (!equal(state.crafts, action.payload)) {
                state.crafts = action.payload;
            }
        },
        [fetchCrafts.rejected]: (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
        },
    },
});

export const { toggleItem } = craftsSlice.actions;

export default craftsSlice.reducer;

export const selectAllCrafts = (state) => state.crafts.crafts;
