import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import equal from 'fast-deep-equal';

import doFetchCrafts from './do-fetch-crafts.mjs';
import { langCode } from '../../modules/lang-helpers.js';
import useItemsData from '../items/index.js';
import useQuestsData from '../quests/index.js';
import { windowHasFocus } from '../../modules/window-focus-handler.mjs';
import { setDataLoading, setDataLoaded } from '../settings/settingsSlice.mjs';

import { placeholderCrafts } from '../../modules/placeholder-data.js';

const initialState = {
    data: placeholderCrafts(langCode()),
    status: 'idle',
    error: null,
};

export const fetchCrafts = createAsyncThunk('crafts/fetchCrafts', (arg, { getState }) => {
    const state = getState();
    const gameMode = state.settings.gameMode;
    return doFetchCrafts({language: langCode(), gameMode});
});

const craftsSlice = createSlice({
    name: 'crafts',
    initialState,
    reducers: {
        toggleItem: (state, action) => {
            let newCrafts = [...state.data];

            newCrafts = newCrafts.map((craft) => {
                craft.requiredItems = craft.requiredItems.map(
                    (requiredItem) => {
                        // Filter an item only if it's not a tool
                        const isTool = requiredItem.attributes.some(element => element.type === "tool");
                        if (isTool === true) {
                            return requiredItem;
                        }

                        if (requiredItem.item.id === action.payload.itemId) {
                            if (requiredItem.count === 0) {
                                requiredItem.count = requiredItem.originalCount;
                            } else {
                                requiredItem.originalCount = requiredItem.count;
                                requiredItem.count = 0;
                            }
                        }

                        return requiredItem;
                    },
                );

                return craft;
            });

            state.data = newCrafts;
        },
        setItemCost: (state, action) => {
            let newCrafts = [...state.data];

            newCrafts = newCrafts.map((craft) => {
                craft.requiredItems = craft.requiredItems.map(
                    (requiredItem) => {
                        if (requiredItem.item.id === action.payload.itemId) {
                            requiredItem.priceCustom = action.payload.price;
                        }

                        return requiredItem;
                    },
                );

                return craft;
            });

            state.data = newCrafts;
        },
        setRewardValue: (state, action) => {
            let newCrafts = [...state.data];

            newCrafts = newCrafts.map((craft) => {
                craft.rewardItems = craft.rewardItems.map(
                    (rewardItem) => {
                        if (rewardItem.item.id === action.payload.itemId) {
                            rewardItem.priceCustom = action.payload.price;
                        }

                        return rewardItem;
                    },
                );

                return craft;
            });

            state.data = newCrafts;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchCrafts.pending, (state, action) => {
            state.status = 'loading';
        });
        builder.addCase(fetchCrafts.fulfilled, (state, action) => {
            state.status = 'succeeded';

            if (!equal(state.data, action.payload)) {
                state.data = action.payload;
            }
        });
        builder.addCase(fetchCrafts.rejected, (state, action) => {
            state.status = 'failed';
            console.log(action.error);
            state.error = action.payload;
        });
    },
});

export const { toggleItem, setItemCost, setRewardValue } = craftsSlice.actions;

export const craftsReducer = craftsSlice.reducer;

const selectCrafts = state => state.crafts.data;
const selectQuests = state => state.quests.data;
const selectItems = state => state.items.data;

export const selectAllCrafts = createSelector([selectCrafts, selectQuests, selectItems], (crafts, quests, items) => {
    return crafts.map(craft => {
        let taskUnlock = craft.taskUnlock;
        if (taskUnlock) {
            taskUnlock = quests.find(t => t.id === taskUnlock.id);
        }
        return {
            ...craft,
            requiredItems: craft.requiredItems.map(req => {
                let matchedItem = items.find(it => it.id === req.item.id);
                if (matchedItem && matchedItem.types.includes('gun')) {
                    if (req.attributes?.some(element => element.type === 'functional' && Boolean(element.value))) {
                        matchedItem = items.find(it => it.id === matchedItem.properties?.defaultPreset?.id);
                    }
                }
                if (!matchedItem) {
                    return false;
                }
                return {
                    ...req,
                    item: matchedItem,
                };
            }).filter(Boolean),
            rewardItems: craft.rewardItems.map(req => {
                const matchedItem = items.find(it => it.id === req.item.id);
                if (!matchedItem) {
                    return false;
                }
                return {
                    ...req,
                    item: matchedItem,
                };
            }).filter(Boolean),
            taskUnlock: taskUnlock,
        };
    }).filter(craft => craft.rewardItems.length > 0 && craft.requiredItems.length > 0);
});

let fetchedGamMode = false;
let refreshInterval = false;

const clearRefreshInterval = () => {
    clearInterval(refreshInterval);
    refreshInterval = false;
};

export default function useCraftsData() {
    const dispatch = useDispatch();
    const { status, error } = useSelector((state) => state.crafts);
    const data = useSelector(selectAllCrafts);
    const gameMode = useSelector((state) => state.settings.gameMode);
    
    useEffect(() => {
        const dataName = 'crafts';
        if (status === 'idle') {
            return;
        } else if (status === 'loading') {
            dispatch(setDataLoading(dataName));
        } else {
            dispatch(setDataLoaded(dataName));
        }
    }, [status, dispatch]);

    useItemsData();
    useQuestsData();
    useEffect(() => {
        if (fetchedGamMode !== gameMode) {
            fetchedGamMode = gameMode;
            dispatch(fetchCrafts());
            clearRefreshInterval();
        }
        if (!refreshInterval) {
            refreshInterval = setInterval(() => {
                if (!windowHasFocus) {
                    return;
                }
                dispatch(fetchCrafts());
            }, 600000);
        }
        return () => {
            clearRefreshInterval();
        };
    }, [dispatch, gameMode]);
    
    return { data, status, error };
};
