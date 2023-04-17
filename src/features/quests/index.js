import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import equal from 'fast-deep-equal';

import doFetchQuests from './do-fetch-quests';
import { langCode } from '../../modules/lang-helpers';
import { placeholderTasks } from '../../modules/placeholder-data';

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

let isFetchingData = false;

export default function useQuestsData() {
    const dispatch = useDispatch();
    const { data, status, error } = useSelector((state) => state.quests);
    const intervalRef = useRef(false);

    useEffect(() => {
        if (!isFetchingData) {
            isFetchingData = true;
            dispatch(fetchQuests());
            intervalRef.current = setInterval(() => {
                dispatch(fetchQuests());
            }, 600000);
        }
        return () => clearInterval(intervalRef.current);
    }, [dispatch]);
    
    return { data, status, error };
};
