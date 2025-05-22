import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import equal from 'fast-deep-equal';

import doFetchStatus from './do-fetch-status.mjs';

const initialState = {
    data: null,
    status: 'idle',
    error: null,
};

export const fetchStatus = createAsyncThunk('status/fetchStatus', () => {
    console.log('createAsyncThunk')
    return doFetchStatus();
});
const statusSlice = createSlice({
    name: 'status',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchStatus.pending, (state, action) => {
            state.status = 'loading';
        });
        builder.addCase(fetchStatus.fulfilled, (state, action) => {
            state.status = 'succeeded';

            if (!equal(state.data, action.payload)) {
                state.data = action.payload;
            }
        });
        builder.addCase(fetchStatus.rejected, (state, action) => {
            state.status = 'failed';
            console.log(action.error);
            state.error = action.payload;
        });
    },
});

export const statusReducer = statusSlice.reducer;

let refreshInterval;

const clearRefreshInterval = () => {
    clearInterval(refreshInterval);
    refreshInterval = false;
};

export default function useStatusData() {
    const dispatch = useDispatch();
    const { data, status, error } = useSelector((state) => state.status);

    useEffect(() => {
        if (!refreshInterval) {
            if (!data) {
                dispatch(fetchStatus());
            }
            refreshInterval = setInterval(() => {
                dispatch(fetchStatus());
            }, 600000);
        }
        return () => {
            clearRefreshInterval();
        };
    }, [dispatch, data]);
    
    return { data, status, error };
};
