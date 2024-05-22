import { useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import equal from 'fast-deep-equal';

import doFetchMeta from './do-fetch-meta.mjs';
import { langCode, useLangCode } from '../../modules/lang-helpers.js';
import { placeholderMeta } from '../../modules/placeholder-data.js';

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

export default function useMetaData() {
    const dispatch = useDispatch();
    const { data, status, error } = useSelector((state) => state.meta);
    const lang = useLangCode();
    const fetchedLang = useRef(false);
    const refreshInterval = useRef(false);
    const clearRefreshInterval = useCallback(() => {
        clearInterval(refreshInterval.current);
        refreshInterval.current = false;
    }, [refreshInterval]);

    useEffect(() => {
        if (fetchedLang.current !== lang) {
            fetchedLang.current = lang;
            dispatch(fetchMeta());
            clearRefreshInterval();
        }
        if (!refreshInterval.current) {
            refreshInterval.current = setInterval(() => {
                dispatch(fetchMeta());
            }, 600000);
        }
        return () => {
            clearRefreshInterval();
        };
    }, [dispatch, fetchedLang, lang, refreshInterval, clearRefreshInterval]);
    
    return { data, status, error };
};
