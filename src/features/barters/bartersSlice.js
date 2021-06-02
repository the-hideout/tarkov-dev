import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const initialState = {
    barters: [],
    status: 'idle',
    error: null,
};

export const fetchBarters = createAsyncThunk('barters/fetchBarters', async () => {
    const bodyQuery = JSON.stringify({query: `{
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
              traderPrices {
                  price
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
              traderPrices {
                price
              }
            }
            count
          }
          source
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

    const bartersData = await response.json();

    return bartersData.data.barters;

});

const bartersSlice = createSlice({
    name: 'barters',
    initialState,
    reducers: {},
    extraReducers: {
        [fetchBarters.pending]: (state, action) => {
            state.status = 'loading';
        },
        [fetchBarters.fulfilled]: (state, action) => {
            state.status = 'succeeded';
            // Add any fetched barters to the array
            state.barters = state.barters.concat(action.payload)
        },
        [fetchBarters.rejected]: (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
        },
    },
});

export default bartersSlice.reducer;

export const selectAllBarters = (state) => state.barters.barters;
