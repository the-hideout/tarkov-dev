import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import equal from 'fast-deep-equal';

import doFetchItems from './do-fetch-items';
import { placeholderItems } from '../../modules/placeholder-data';
import { langCode } from '../../modules/lang-helpers';

const addPresets = (items) => {
    return items.map(item => {
        const newItem = {...item};
        if (newItem.properties?.defaultPreset) {
            newItem.properties = {...newItem.properties};
            const preset = items.find(it => it.id === newItem.properties.defaultPreset.id);
            if (preset) {
                newItem.properties.defaultPreset = preset;
            } else {
                newItem.properties.defaultPreset = undefined;
            }
        }
        if (newItem.properties?.presets) {
            newItem.properties = {...newItem.properties};
            newItem.properties.presets = newItem.properties.presets.reduce((presets, currentPreset) => {
                const preset = items.find(it => it.id === currentPreset.id);
                if (preset) {
                    presets.push(preset);
                }
                return presets;
            }, []);
        }
        return newItem;
    });
};

const initialState = {
    items: placeholderItems(langCode()),
    status: 'idle',
    error: null,
};

export const fetchItems = createAsyncThunk('items/fetchItems', () =>
    doFetchItems(langCode()),
);
const itemsSlice = createSlice({
    name: 'items',
    initialState,
    reducers: {
        setCustomSellValue: (state, action) => {
            const item = state.items.find(i => i.id === action.payload.itemId);
            if (!item) {
                return;
            }
            item.priceCustom = action.payload.price;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchItems.pending, (state, action) => {
            state.status = 'loading';
            state.items = addPresets(itemsSlice.getInitialState().items);
        });
        builder.addCase(fetchItems.fulfilled, (state, action) => {
            state.status = 'succeeded';
            const items = addPresets(action.payload);
            if (!equal(state.items, items)) {
                state.items = items;
            }
        });
        builder.addCase(fetchItems.rejected, (state, action) => {
            state.status = 'failed';
            console.log(action.error);
            state.error = action.payload;
        });
    },
});

export const { setCustomSellValue } = itemsSlice.actions;

export default itemsSlice.reducer;

export const selectAllItems = (state) => state.items.items;
