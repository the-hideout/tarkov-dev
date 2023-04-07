import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import equal from 'fast-deep-equal';

import doFetchQuests from './do-fetch-quests';
import { langCode } from '../../modules/lang-helpers';
import { placeholderTasks } from '../../modules/placeholder-data';

const initialState = {
    quests: placeholderTasks(langCode()),
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
            state.quests = questsSlice.getInitialState().quests;
        });
        builder.addCase(fetchQuests.fulfilled, (state, action) => {
            state.status = 'succeeded';

            if (!equal(state.quests, action.payload)) {
                state.quests = action.payload;
            }
        });
        builder.addCase(fetchQuests.rejected, (state, action) => {
            state.status = 'failed';
            console.log(action.error);
            state.error = action.payload;
        });
    },
});

export default questsSlice.reducer;

export const selectQuests = (state) => state.quests.quests;
