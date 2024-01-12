import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import equal from 'fast-deep-equal';

import doFetchQuests from './do-fetch-quests.mjs';
import { langCode } from '../../modules/lang-helpers.js';
import { placeholderTasks } from '../../modules/placeholder-data.js';

const initialState = {
    data: placeholderTasks(langCode()),
    status: 'idle',
    error: null,
};

export const fetchQuests = createAsyncThunk('quests/fetchQuests', () =>
    doFetchQuests(langCode()),
);
const questsSlice = createSlice({
    name: 'quests',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchQuests.pending, (state, action) => {
            state.status = 'loading';
        });
        builder.addCase(fetchQuests.fulfilled, (state, action) => {
            state.status = 'succeeded';

            if (!equal(state.data, action.payload)) {
                state.data = action.payload;
            }
        });
        builder.addCase(fetchQuests.rejected, (state, action) => {
            state.status = 'failed';
            console.log(action.error);
            state.error = action.payload;
        });
    },
});

export const questsReducer = questsSlice.reducer;

export const selectQuests = (state) => state.quests.data;

let fetchedData = false;
let refreshInterval = false;

export default function useQuestsData() {
    const dispatch = useDispatch();
    const { data, status, error } = useSelector((state) => state.quests);

    useEffect(() => {
        if (!fetchedData) {
            fetchedData = true;
            dispatch(fetchQuests());
        }
        if (!refreshInterval) {
            refreshInterval = setInterval(() => {
                dispatch(fetchQuests());
            }, 600000);
        }
        return () => {
            clearInterval(refreshInterval);
            refreshInterval = false;
        };
    }, [dispatch]);
    
    return { data, status, error };
};
