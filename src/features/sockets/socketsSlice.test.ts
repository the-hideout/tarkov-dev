import { describe, expect, it } from "@rstest/core";
import reducer, {
    disableConnection,
    enableConnection,
    setConnectionStatus,
    setControlId,
} from "#src/features/sockets/socketsSlice";

describe("socket connection state", () => {
    it("follows connect, disconnect and retry transitions without stale connected state", () => {
        let state = reducer(undefined, enableConnection());
        state = reducer(state, setControlId("remote-client"));
        state = reducer(state, setConnectionStatus("connecting"));
        expect(state.enabled).toBe(true);
        expect(state.connected).toBe(false);
        expect(state.controlId).toBe("remote-client");
        state = reducer(state, setConnectionStatus("connected"));
        expect(state.connected).toBe(true);
        state = reducer(state, setConnectionStatus("disconnected"));
        expect(state.connected).toBe(false);
        state = reducer(state, setConnectionStatus("connecting"));
        state = reducer(state, setConnectionStatus("failed"));
        expect(state.status).toBe("failed");
        expect(state.connected).toBe(false);
        state = reducer(state, setConnectionStatus("idle"));
        state = reducer(state, disableConnection());
        state = reducer(state, setControlId(false));
        expect(state.enabled).toBe(false);
        expect(state.controlId).toBe(false);
        expect(state.status).toBe("idle");
    });
});
