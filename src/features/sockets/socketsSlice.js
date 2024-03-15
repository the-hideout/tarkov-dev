import { createSlice } from '@reduxjs/toolkit';

const socketsSlice = createSlice({
    name: 'sockets',
    initialState: {
        id: false,
        controlId: false,
        connected: false,
        enabled: false,
        status: 'idle',
        error: null,
    },
    reducers: {
        setControlId: (state, action) => {
            state.controlId = action.payload;
        },
        setConnectionStatus: (state, action) => {
            state.connected = action.payload;
        },
        enableConnection: (state) => {
            state.enabled = true;
        },
    },
});

export const { setControlId, setConnectionStatus, enableConnection } =
    socketsSlice.actions;

export default socketsSlice.reducer;
