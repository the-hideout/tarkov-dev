import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import equal from 'fast-deep-equal';
import { useQuery } from 'react-query';

import doFetchBarters from './do-fetch-barters';

export const useBartersQuery = (queryOptions) => {
    const bartersQuery = useQuery('barters', () => doFetchBarters(), {
        refetchInterval: 600000,
        placeholderData: [],
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        ...queryOptions,
    });

    return bartersQuery;
};

const initialState = {
    barters: [],
    status: 'idle',
    error: null,
};

export const fetchBarters = createAsyncThunk(
    'barters/fetchBarters',
    () => doFetchBarters(),
);

const bartersSlice = createSlice({
    name: 'barters',
    initialState,
    reducers: {
        toggleItem: (state, action) => {
            let newBarters = [...state.barters];

            newBarters = newBarters.map((barter) => {
                barter.requiredItems = barter.requiredItems.map(
                    (requiredItem) => {
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

                return barter;
            });

            state.barters = newBarters;
        },
    },
    extraReducers: {
        [fetchBarters.pending]: (state, action) => {
            state.status = 'loading';
        },
        [fetchBarters.fulfilled]: (state, action) => {
            state.status = 'succeeded';

            if (!equal(state.barters, action.payload)) {
                state.barters = action.payload;
            }
        },
        [fetchBarters.rejected]: (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
        },
    },
});

export const { toggleItem } = bartersSlice.actions;

export default bartersSlice.reducer;

export const selectAllBarters = (state) => state.barters.barters;
