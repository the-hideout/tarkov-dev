import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import equal from 'fast-deep-equal';

import { langCode } from '../../modules/lang-helpers';
import doFetchTraders from './do-fetch-traders';

import { placeholderTraders } from '../../modules/placeholder-data';

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

let isFetchingData = false;

export default function useTradersData() {
    const dispatch = useDispatch();
    const { data, status, error } = useSelector((state) => state.traders);
    const intervalRef = useRef(false);

    useEffect(() => {
        if (!isFetchingData) {
            isFetchingData = true;
            dispatch(fetchTraders());
            intervalRef.current = setInterval(() => {
                dispatch(fetchTraders());
            }, 600000);
        }
        return () => clearInterval(intervalRef.current);
    }, [dispatch]);
    
    return { data, status, error };
};
