import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import equal from 'fast-deep-equal';

import doFetchAchievements from './do-fetch-achievements.mjs';
import { langCode } from '../../modules/lang-helpers.js';

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

let fetchedData = false;
let refreshInterval = false;

export default function useAchievementsData() {
    const dispatch = useDispatch();
    const { data, status, error } = useSelector((state) => state.achievements);

    useEffect(() => {
        if (!fetchedData) {
            fetchedData = true;
            dispatch(fetchAchievements());
        }
        if (!refreshInterval) {
            refreshInterval = setInterval(() => {
                dispatch(fetchAchievements());
            }, 600000);
        }
        return () => {
            clearInterval(refreshInterval);
            refreshInterval = false;
        };
    }, [dispatch]);
    
    return { data, status, error };
};
