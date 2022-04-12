import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import equal from 'fast-deep-equal';

const initialState = {
    crafts: [],
    status: 'idle',
    error: null,
};

export const fetchCrafts = createAsyncThunk('crafts/fetchCrafts', async () => {
    const bodyQuery = JSON.stringify({
        query: `{
        crafts {
          rewardItems {
            item {
              id
              basePrice
              name
              normalizedName
              iconLink
              imageLink
              wikiLink
              avg24hPrice
              lastLowPrice
              traderPrices {
                  price
                  trader {
                      name
                  }
              }
              buyFor {
                source
                price
                currency
              }
              sellFor {
                source
                price
                currency
              }
              types
            }
            count
          }
          requiredItems {
            item {
              id
              basePrice
              name
              normalizedName
              iconLink
              imageLink
              wikiLink
              avg24hPrice
              lastLowPrice
              traderPrices {
                price
                trader {
                    name
                }
              }
              buyFor {
                source
                price
                currency
              }
              sellFor {
                source
                price
                currency
              }
            }
            count
          }
          source
          duration
        }
    }`,
    });

    const response = await fetch('https://api.tarkov.dev/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: bodyQuery,
    });

    const craftsData = await response.json();

    return craftsData.data.crafts.filter(
        (craft) => !craft.source.toLowerCase().includes('christmas'),
    );
});

const craftsSlice = createSlice({
    name: 'crafts',
    initialState,
    reducers: {
        toggleItem: (state, action) => {
            let newCrafts = [...state.crafts];

            console.log(action.payload.itemId);

            newCrafts = newCrafts.map((craft) => {
                craft.requiredItems = craft.requiredItems.map(
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

                return craft;
            });

            state.crafts = newCrafts;
        },
    },
    extraReducers: {
        [fetchCrafts.pending]: (state, action) => {
            state.status = 'loading';
        },
        [fetchCrafts.fulfilled]: (state, action) => {
            state.status = 'succeeded';

            if (!equal(state.crafts, action.payload)) {
                state.crafts = action.payload;
            }
        },
        [fetchCrafts.rejected]: (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
        },
    },
});

export const { toggleItem } = craftsSlice.actions;

export default craftsSlice.reducer;

export const selectAllCrafts = (state) => state.crafts.crafts;
