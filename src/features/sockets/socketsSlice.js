import { createSlice } from "@reduxjs/toolkit";

const socketsSlice = createSlice({
    name: "sockets",
    initialState: {
        id: false,
        controlId: false,
        connected: false,
        enabled: false,
        status: "idle",
        error: null,
    },
    reducers: {
        setControlId: (state, action) => {
            state.controlId = action.payload;
        },
        setConnectionStatus: (state, action) => {
            state.status = action.payload;
            state.connected = action.payload === "connected";
        },
        enableConnection: (state) => {
            state.enabled = true;
        },
        disableConnection: (state) => {
            state.enabled = false;
        },
    },
});

export const { setControlId, setConnectionStatus, enableConnection, disableConnection } = socketsSlice.actions;

export default socketsSlice.reducer;
