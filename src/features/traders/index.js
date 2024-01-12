import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import equal from 'fast-deep-equal';

import { langCode } from '../../modules/lang-helpers.js';
import doFetchTraders from './do-fetch-traders.mjs';

import { placeholderTraders } from '../../modules/placeholder-data.js';

const initialState = {
    data: placeholderTraders(langCode()),
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

            if (!equal(state.data, action.payload)) {
                state.data = action.payload;
            }
        });
        builder.addCase(fetchTraders.rejected, (state, action) => {
            state.status = 'failed';
            console.log(action.error);
            state.error = action.payload;
        });
    },
});

export const tradersReducer = tradersSlice.reducer;

export const selectAllTraders = (state) => state.traders.data;

let fetchedData = false;
let refreshInterval = false;

export default function useTradersData() {
    const dispatch = useDispatch();
    const { data, status, error } = useSelector((state) => state.traders);

    useEffect(() => {
        if (!fetchedData) {
            fetchedData = true;
            dispatch(fetchTraders());
        }
        if (!refreshInterval) {
            refreshInterval = setInterval(() => {
                dispatch(fetchTraders());
            }, 600000);
        }
        return () => {
            clearInterval(refreshInterval);
            refreshInterval = false;
        };
    }, [dispatch]);
    
    return { data, status, error };
};
