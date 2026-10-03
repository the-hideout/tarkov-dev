import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import equal from "fast-deep-equal";

import doFetchHideout from "./do-fetch-hideout.mjs";

import { langCode, useLangCode } from "../../modules/lang-helpers.js";
import { windowHasFocus } from "../../modules/window-focus-handler.mjs";
import { setDataLoading, setDataLoaded } from "../settings/settingsSlice.mjs";
import useCraftsData, { selectAllCrafts } from "../crafts/index.js";

const initialState = {
    data: [],
    status: "idle",
    error: null,
};

export const fetchHideout = createAsyncThunk("hideout/fetchHideout", (arg, { getState }) => {
    const state = getState();
    const gameMode = state.settings.gameMode;
    return doFetchHideout({ language: langCode(), gameMode });
});

const hideoutSlice = createSlice({
    name: "hideout",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchHideout.pending, (state, action) => {
            state.status = "loading";
        });
        builder.addCase(fetchHideout.fulfilled, (state, action) => {
            state.status = "succeeded";

            if (!equal(state.hideout, action.payload)) {
                state.data = action.payload;
            }
        });
        builder.addCase(fetchHideout.rejected, (state, action) => {
            state.status = "failed";
            console.log(action.error);
            state.error = action.payload;
        });
    },
});

export const hideoutReducer = hideoutSlice.reducer;

export const selectHideoutModules = (state) => state.hideout.data;

export const selectAllHideoutModules = createSelector([selectHideoutModules, selectAllCrafts], (stations, crafts) => {
    return stations.map((station) => {
        return {
            ...station,
            crafts: crafts.reduce((crafts, craft) => {
                if (craft.station.id === station.id) {
                    crafts.push({ id: craft.id });
                }
                return crafts;
            }, []),
        };
    });
});

let fetchedLang = false;
let fetchedGameMode = false;
let refreshInterval = false;

const clearRefreshInterval = () => {
    clearInterval(refreshInterval);
    refreshInterval = false;
};

export default function useHideoutData() {
    const dispatch = useDispatch();
    const { status, error } = useSelector((state) => state.hideout);
    const data = useSelector(selectAllHideoutModules);
    const lang = useLangCode();
    const gameMode = useSelector((state) => state.settings.gameMode);

    useEffect(() => {
        const dataName = "hideout";
        if (status === "idle") {
            return;
        } else if (status === "loading") {
            dispatch(setDataLoading(dataName));
        } else {
            dispatch(setDataLoaded(dataName));
        }
    }, [status, dispatch]);

    useCraftsData();

    useEffect(() => {
        if (fetchedLang !== lang || fetchedGameMode !== gameMode) {
            fetchedLang = lang;
            fetchedGameMode = gameMode;
            dispatch(fetchHideout());
            clearRefreshInterval();
        }
        if (!refreshInterval) {
            refreshInterval = setInterval(() => {
                if (!windowHasFocus) {
                    return;
                }
                dispatch(fetchHideout());
            }, 600000);
        }
        return () => {
            clearRefreshInterval();
        };
    }, [dispatch, lang, gameMode]);

    return { data, status, error };
}
