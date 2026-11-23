import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type SocketConnectionStatus = "idle" | "connecting" | "connected" | "disconnected" | "failed";

export interface SocketsState {
    id: string | false;
    controlId: string | false;
    connected: boolean;
    enabled: boolean;
    status: SocketConnectionStatus;
    error: string | null;
}

const initialState: SocketsState = {
    id: false,
    controlId: false,
    connected: false,
    enabled: false,
    status: "idle",
    error: null,
};

const socketsSlice = createSlice({
    name: "sockets",
    initialState,
    reducers: {
        setControlId: (state, action: PayloadAction<string | false>) => {
            state.controlId = action.payload;
        },
        setConnectionStatus: (state, action: PayloadAction<SocketConnectionStatus>) => {
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
