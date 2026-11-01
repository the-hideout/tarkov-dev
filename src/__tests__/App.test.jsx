import { expect, it } from "@rstest/core";
import { waitFor, screen } from "@testing-library/react";
import React from "react";
import { mockAllIsIntersecting } from "react-intersection-observer/test-utils";

import App from "#src/App.jsx";
import { renderWithProviders } from "#src/__tests__/test-utils.js";

it("renders without crashing", async () => {
    mockAllIsIntersecting(true);

    renderWithProviders(<App />);

    await waitFor(() => {
        expect(screen.getByRole("navigation")).toHaveClass("navigation");
    });
});
