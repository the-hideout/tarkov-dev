import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const initialState = {
    crafts: [],
    status: 'idle',
    error: null,
};

export const fetchCrafts = createAsyncThunk('crafts/fetchCrafts', async () => {
    const bodyQuery = JSON.stringify({query: `{
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
    }`
    });

    const response = await fetch('https://tarkov-tools.com/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: bodyQuery,
    });

    const craftsData = await response.json();

    return craftsData.data.crafts;

});

const craftsSlice = createSlice({
    name: 'crafts',
    initialState,
    reducers: {},
    extraReducers: {
        [fetchCrafts.pending]: (state, action) => {
            state.status = 'loading';
        },
        [fetchCrafts.fulfilled]: (state, action) => {
            state.status = 'succeeded';
            // Add any fetched crafts to the array
            state.crafts = action.payload;
        },
        [fetchCrafts.rejected]: (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
        },
    },
});

export default craftsSlice.reducer;

export const selectAllCrafts = (state) => state.crafts.crafts;
