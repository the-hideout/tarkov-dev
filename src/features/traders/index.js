import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import equal from "fast-deep-equal";

import { langCode, useLangCode } from "../../modules/lang-helpers.js";
import doFetchTraders from "./do-fetch-traders.mjs";
import useBartersData from "../barters/index.js";

const initialState = {
    data: [],
    status: "idle",
    error: null,
};

export const fetchTraders = createAsyncThunk("traders/fetchTraders", (arg, { getState }) => {
    const state = getState();
    const gameMode = state.settings.gameMode;
    return doFetchTraders({ language: langCode(), gameMode });
});
const tradersSlice = createSlice({
    name: "traders",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchTraders.pending, (state, action) => {
            state.status = "loading";
        });
        builder.addCase(fetchTraders.fulfilled, (state, action) => {
            state.status = "succeeded";

            if (!equal(state.data, action.payload)) {
                state.data = action.payload;
            }
        });
        builder.addCase(fetchTraders.rejected, (state, action) => {
            state.status = "failed";
            console.log(action.error);
            state.error = action.payload;
        });
    },
});

export const tradersReducer = tradersSlice.reducer;

export const selectTraders = (state) => state.traders.data;
const selectBarters = (state) => state.barters.data;
const selectItems = (state) => state.items.data;

export const selectAllTraders = createSelector(
    [selectTraders, selectBarters, selectItems],
    (traders, barters, items) => {
        const currencyMap = {
            RUB: "5449016a4bdc2d6f028b456f",
            USD: "5696686a4bdc2da3298b456a",
            EUR: "569668774bdc2da2298b4568",
        };

        return traders.map((t) => {
            const trader = { ...t };
            trader.barters = barters.filter((barter) => barter.trader.id === trader.id).map((barter) => barter.id);

            const currency = items.items[currencyMap[trader.currencyISO]];
            if (currency) {
                trader.currency = {
                    id: currency.id,
                    name: currency.name,
                    normalizedName: currency.normalizedName,
                };
            }

            return trader;
        });
    },
);

let fetchedLang = false;
let fetchedGameMode = false;
let refreshInterval = false;

const clearRefreshInterval = () => {
    clearInterval(refreshInterval);
    refreshInterval = false;
};

export default function useTradersData() {
    const dispatch = useDispatch();
    const { status, error } = useSelector((state) => state.traders);
    const data = useSelector(selectAllTraders);

    const lang = useLangCode();
    const gameMode = useSelector((state) => state.settings.gameMode);

    useBartersData();

    useEffect(() => {
        if (fetchedLang !== lang || fetchedGameMode !== gameMode) {
            fetchedLang = lang;
            fetchedGameMode = gameMode;
            dispatch(fetchTraders());
            clearRefreshInterval();
        }
        if (!refreshInterval) {
            refreshInterval = setInterval(() => {
                dispatch(fetchTraders());
            }, 600000);
        }
        return () => {
            clearRefreshInterval();
        };
    }, [dispatch, lang, gameMode]);

    return { data, status, error };
}
