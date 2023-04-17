import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import equal from 'fast-deep-equal';

import doFetchMeta from './do-fetch-meta';
import { langCode } from '../../modules/lang-helpers';
import { placeholderMeta } from '../../modules/placeholder-data';

const initialState = {
    data: placeholderMeta(langCode()),
    status: 'idle',
    error: null,
};

export const fetchMeta = createAsyncThunk('meta/fetchMeta', () =>
    doFetchMeta(langCode()),
);
const metaSlice = createSlice({
    name: 'meta',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchMeta.pending, (state, action) => {
            state.status = 'loading';
        });
        builder.addCase(fetchMeta.fulfilled, (state, action) => {
            state.status = 'succeeded';

            if (!equal(state.data, action.payload)) {
                state.data = action.payload;
            }
        });
        builder.addCase(fetchMeta.rejected, (state, action) => {
            state.status = 'failed';
            console.log(action.error);
            state.error = action.payload;
        });
    },
});

export const metaReducer = metaSlice.reducer;

export const selectMeta = (state) => state.meta.data;

let isFetchingData = false;

export default function useMetaData() {
    const dispatch = useDispatch();
    const { data, status, error } = useSelector((state) => state.meta);
    const intervalRef = useRef(false);

    useEffect(() => {
        if (!isFetchingData) {
            isFetchingData = true;
            dispatch(fetchMeta());
            intervalRef.current = setInterval(() => {
                dispatch(fetchMeta());
            }, 600000);
        }
        return () => clearInterval(intervalRef.current);
    }, [dispatch]);
    
    return { data, status, error };
};
