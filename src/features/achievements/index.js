import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import equal from 'fast-deep-equal';

import doFetchAchievements from './do-fetch-achievements.mjs';
import { langCode, useLangCode } from '../../modules/lang-helpers.js';

const initialState = {
    data: [],
    status: 'idle',
    error: null,
};

export const fetchAchievements = createAsyncThunk('achievements/fetchAchievements', () =>
    doFetchAchievements(langCode()),
);
const achievementsSlice = createSlice({
    name: 'achievements',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchAchievements.pending, (state, action) => {
            state.status = 'loading';
        });
        builder.addCase(fetchAchievements.fulfilled, (state, action) => {
            state.status = 'succeeded';

            if (!equal(state.data, action.payload)) {
                state.data = action.payload;
            }
        });
        builder.addCase(fetchAchievements.rejected, (state, action) => {
            state.status = 'failed';
            console.log(action.error);
            state.error = action.payload;
        });
    },
});

export const achievementsReducer = achievementsSlice.reducer;

let fetchedLang = false;
let refreshInterval = false;

const clearRefreshInterval = () => {
    clearInterval(refreshInterval);
    refreshInterval = false;
};

export default function useAchievementsData() {
    const dispatch = useDispatch();
    const { data, status, error } = useSelector((state) => state.achievements);
    const lang = useLangCode();

    useEffect(() => {
        if (fetchedLang !== lang) {
            fetchedLang = lang;
            dispatch(fetchAchievements());
            clearRefreshInterval();
        }
        if (!refreshInterval) {
            refreshInterval = setInterval(() => {
                dispatch(fetchAchievements());
            }, 600000);
        }
        return () => {
            clearRefreshInterval();
        };
    }, [dispatch, lang]);
    
    return { data, status, error };
};
