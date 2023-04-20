import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import equal from 'fast-deep-equal';

import doFetchCrafts from './do-fetch-crafts';
import { langCode } from '../../modules/lang-helpers';
import useItemsData from '../items';
import useQuestsData from '../quests';

import { placeholderCrafts } from '../../modules/placeholder-data';

const initialState = {
    data: placeholderCrafts(langCode()),
    status: 'idle',
    error: null,
};

export const fetchCrafts = createAsyncThunk('crafts/fetchCrafts', async () => 
    doFetchCrafts(langCode()),
);

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

export const selectAllCrafts = (state) => {
    return state.crafts.data.map(craft => {
        let taskUnlock = craft.taskUnlock;
        if (taskUnlock) {
            taskUnlock = state.quests.data.find(t => t.id === taskUnlock.id);
        }
        return {
            ...craft,
            requiredItems: craft.requiredItems.map(req => {
                let matchedItem = state.items.data.find(it => it.id === req.item.id);
                if (matchedItem && matchedItem.types.includes('gun')) {
                    if (req.attributes?.some(element => element.type === 'functional' && Boolean(element.value))) {
                        matchedItem = state.items.data.find(it => it.id === matchedItem.properties?.defaultPreset?.id);
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
                const matchedItem = state.items.data.find(it => it.id === req.item.id);
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
};

let fetchedData = false;
let refreshInterval = false;

export default function useCraftsData() {
    const dispatch = useDispatch();
    const { status, error } = useSelector((state) => state.crafts);
    const data = useSelector(selectAllCrafts);

    useItemsData();
    useQuestsData();
    useEffect(() => {
        if (!fetchedData) {
            fetchedData = true;
            dispatch(fetchCrafts());
        }
        if (!refreshInterval) {
            refreshInterval = setInterval(() => {
                dispatch(fetchCrafts());
            }, 600000);
        }
        return () => {
            clearInterval(refreshInterval);
            refreshInterval = false;
        };
    }, [dispatch]);
    
    return { data, status, error };
};
