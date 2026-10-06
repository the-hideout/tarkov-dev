import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import equal from "fast-deep-equal";

import doFetchSeason from "./do-fetch-season.mjs";
import { windowHasFocus } from "../../modules/window-focus-handler.mjs";

const initialState = {
    data: null,
    status: "idle",
    error: null,
};

export const fetchSeason = createAsyncThunk("season/fetchSeason", () => {
    return doFetchSeason();
});
const seasonSlice = createSlice({
    name: "season",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchSeason.pending, (state, action) => {
            state.status = "loading";
        });
        builder.addCase(fetchSeason.fulfilled, (state, action) => {
            state.status = "succeeded";

            if (!equal(state.data, action.payload)) {
                state.data = action.payload;
            }
        });
        builder.addCase(fetchSeason.rejected, (state, action) => {
            state.status = "failed";
            console.log(action.error);
            state.error = action.payload;
        });
    },
});

export const seasonReducer = seasonSlice.reducer;

let refreshInterval;

const clearRefreshInterval = () => {
    clearInterval(refreshInterval);
    refreshInterval = false;
};

export default function useSeasonData() {
    const dispatch = useDispatch();
    const { data, status, error } = useSelector((state) => state.season);

    useEffect(() => {
        if (!refreshInterval) {
            if (!data) {
                dispatch(fetchSeason());
            }
            refreshInterval = setInterval(() => {
                if (!windowHasFocus) {
                    return;
                }
                dispatch(fetchSeason());
            }, 600000);
        }
        return () => {
            clearRefreshInterval();
        };
    }, [dispatch, data]);

    return { data, status, error };
}
