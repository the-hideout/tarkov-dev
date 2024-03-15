import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import equal from 'fast-deep-equal';

import doFetchBarters from './do-fetch-barters.mjs';
import { langCode } from '../../modules/lang-helpers.js';
import useItemsData from '../items/index.js';
import useQuestsData from '../quests/index.js';

import { placeholderBarters } from '../../modules/placeholder-data.js';

const initialState = {
    data: placeholderBarters(langCode()),
    status: 'idle',
    error: null,
};

export const fetchBarters = createAsyncThunk('barters/fetchBarters', () =>
    doFetchBarters(langCode())
);

const bartersSlice = createSlice({
    name: 'barters',
    initialState,
    reducers: {
        toggleItem: (state, action) => {
            let newBarters = [...state.data];

            newBarters = newBarters.map((barter) => {
                barter.requiredItems = barter.requiredItems.map(
                    (requiredItem) => {
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

                return barter;
            });

            state.data = newBarters;
        },
        setItemCost: (state, action) => {
            let newBarters = [...state.data];

            newBarters = newBarters.map((barter) => {
                barter.requiredItems = barter.requiredItems.map(
                    (requiredItem) => {
                        if (requiredItem.item.id === action.payload.itemId) {
                            requiredItem.priceCustom = action.payload.price;
                        }

                        return requiredItem;
                    },
                );

                return barter;
            });

            state.data = newBarters;
        },
        setRewardValue: (state, action) => {
            let newBarters = [...state.data];

            newBarters = newBarters.map((barter) => {
                barter.rewardItems = barter.rewardItems.map(
                    (rewardItem) => {
                        if (rewardItem.item.id === action.payload.itemId) {
                            rewardItem.priceCustom = action.payload.price;
                        }

                        return rewardItem;
                    },
                );

                return barter;
            });

            state.data = newBarters;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchBarters.pending, (state, action) => {
            state.status = 'loading';
        });
        builder.addCase(fetchBarters.fulfilled, (state, action) => {
            state.status = 'succeeded';

            if (!equal(state.data, action.payload)) {
                state.data = action.payload;
            }
        });
        builder.addCase(fetchBarters.rejected, (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
        });
    },
});

export const { toggleItem, setItemCost, setRewardValue } = bartersSlice.actions;

export const bartersReducer = bartersSlice.reducer;

const selectBarters = state => state.barters.data;
const selectQuests = state => state.quests.data;
const selectItems = state => state.items.data;

export const selectAllBarters = createSelector([selectBarters, selectQuests, selectItems], (barters, quests, items) => {
    return barters.map(barter => {
        let taskUnlock = barter.taskUnlock;
        if (taskUnlock) {
            taskUnlock = quests.find(t => t.id === taskUnlock.id);
        }
        return {
            ...barter,
            requiredItems: barter.requiredItems.reduce((requirements, req) => {
                let matchedItem = items.find(it => it.id === req.item.id);
                if (matchedItem) {
                    requirements.push({
                        ...req,
                        item: matchedItem,
                    });
                }
                return requirements;
            }, []),
            rewardItems: barter.rewardItems.reduce((requirements, req) => {
                const matchedItem = items.find(it => it.id === req.item.id);
                if (matchedItem) {
                    requirements.push({
                        ...req,
                        item: matchedItem,
                    });
                }
                return requirements;
            }, []),
            taskUnlock: taskUnlock,
        };
    }).filter(barter => barter.rewardItems.length > 0 && barter.requiredItems.length > 0); 
});

let fetchedData = false;
let refreshInterval = false;

export default function useBartersData() {
    const dispatch = useDispatch();
    const { status, error } = useSelector((state) => state.barters);
    const data = useSelector(selectAllBarters);

    useItemsData();
    useQuestsData();
    useEffect(() => {
        if (!fetchedData) {
            fetchedData = true;
            dispatch(fetchBarters());
        }
        if (!refreshInterval) {
            refreshInterval = setInterval(() => {
                dispatch(fetchBarters());
            }, 600000);
        }
        return () => {
            clearInterval(refreshInterval);
            refreshInterval = false;
        };
    }, [dispatch]);
    
    return { data, status, error };
};
