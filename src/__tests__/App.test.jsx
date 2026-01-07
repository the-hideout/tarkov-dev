import { expect, it } from "@rstest/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { waitFor, screen } from "@testing-library/react";
import React from "react";
import { mockAllIsIntersecting } from "react-intersection-observer/test-utils";

import App from "#src/App.jsx";
import { renderWithProviders } from "#src/__tests__/test-utils.js";

const queryClient = new QueryClient();

it("renders without crashing", async () => {
    mockAllIsIntersecting(true);

    renderWithProviders(
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>,
    );

    await waitFor(() => {
        expect(screen.getByRole("navigation")).toHaveClass("navigation");
    });
});
