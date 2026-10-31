import { afterEach, describe, expect, it } from "@rstest/core";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter, useLocation } from "react-router";

import "#src/i18n.js";
import socketsReducer from "#src/features/sockets/socketsSlice";
import Connect from "./Connect";

function Location() {
    const location = useLocation();
    return <output data-testid="location">{location.pathname}</output>;
}

function renderConnect() {
    const store = configureStore({ reducer: { sockets: socketsReducer } });
    render(
        <Provider store={store}>
            <MemoryRouter initialEntries={["/connect"]}>
                <Connect />
                <Location />
            </MemoryRouter>
        </Provider>,
    );
    return store;
}

afterEach(cleanup);

describe("remote control connection", () => {
    it("keeps the connection disabled for missing or incomplete IDs", () => {
        const store = renderConnect();
        const input = screen.getByRole("textbox");
        const connect = screen.getByRole("button");

        fireEvent.click(connect);
        expect(document.activeElement).toBe(input);
        expect(store.getState().sockets.enabled).toBe(false);
        expect(screen.getByTestId("location").textContent).toBe("/connect");

        fireEvent.change(input, { target: { value: "ab" } });
        fireEvent.click(connect);
        expect(store.getState().sockets.controlId).toBe("AB");
        expect(store.getState().sockets.enabled).toBe(false);
        expect(screen.getByTestId("location").textContent).toBe("/connect");
    });

    it("normalizes the control ID, enables the connection and navigates to control", () => {
        const store = renderConnect();
        fireEvent.change(screen.getByRole("textbox"), { target: { value: " abcd5 " } });
        expect(store.getState().sockets.controlId).toBe("ABCD");

        fireEvent.click(screen.getByRole("button"));
        expect(store.getState().sockets.enabled).toBe(true);
        expect(screen.getByTestId("location").textContent).toBe("/control/");
        expect(screen.getByRole("button").getAttribute("value")).toContain("ABCD");
    });
});
