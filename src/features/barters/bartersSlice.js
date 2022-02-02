import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import equal from 'fast-deep-equal';

const initialState = {
    barters: [],
    status: 'idle',
    error: null,
};

export const fetchBarters = createAsyncThunk(
    'barters/fetchBarters',
    async () => {
        const bodyQuery = JSON.stringify({
            query: `{
        barters {
          rewardItems {
            item {
              id
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
          requiredItems {
            item {
              id
              name
              normalizedName
              iconLink
              imageLink
              wikiLink
              avg24hPrice
              lastLowPrice
              traderPrices {
                price
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
        }
    }`,
        });

        const response = await fetch('https://tarkov-tools.com/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: bodyQuery,
        });

        const bartersData = await response.json();

        return bartersData.data.barters;
    },
);

const bartersSlice = createSlice({
    name: 'barters',
    initialState,
    reducers: {
        toggleItem: (state, action) => {
            let newBarters = [...state.barters];

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

            state.barters = newBarters;
        },
    },
    extraReducers: {
        [fetchBarters.pending]: (state, action) => {
            state.status = 'loading';
        },
        [fetchBarters.fulfilled]: (state, action) => {
            state.status = 'succeeded';

            if (!equal(state.barters, action.payload)) {
                state.barters = action.payload;
            }
        },
        [fetchBarters.rejected]: (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
        },
    },
});

export const { toggleItem } = bartersSlice.actions;

export default bartersSlice.reducer;

export const selectAllBarters = (state) => state.barters.barters;
