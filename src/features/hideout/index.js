import { useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import equal from 'fast-deep-equal';

import doFetchHideout from './do-fetch-hideout.mjs';

import { langCode, useLangCode } from '../../modules/lang-helpers.js';
import { placeholderHideout } from '../../modules/placeholder-data.js';

const initialState = {
    data: placeholderHideout(langCode()),
    status: 'idle',
    error: null,
};

export const fetchHideout = createAsyncThunk(
    'hideout/fetchHideout',
    async () => doFetchHideout(langCode())
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
                state.data = action.payload;
            }
        });
        builder.addCase(fetchHideout.rejected, (state, action) => {
            state.status = 'failed';
            console.log(action.error);
            state.error = action.payload;
        });
    },
});

export const hideoutReducer = hideoutSlice.reducer;

export const selectAllHideoutModules = (state) => state.hideout.data;

export default function useHideoutData() {
    const dispatch = useDispatch();
    const { data, status, error } = useSelector((state) => state.hideout);
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
            dispatch(fetchHideout());
            clearRefreshInterval();
        }
        if (!refreshInterval.current) {
            refreshInterval.current = setInterval(() => {
                dispatch(fetchHideout());
            }, 600000);
        }
        return () => {
            clearRefreshInterval();
        };
    }, [dispatch, fetchedLang, lang, refreshInterval, clearRefreshInterval]);
    
    return { data, status, error };
};
