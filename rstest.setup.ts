import "dotenv/config";
import "@testing-library/jest-dom";

import { resetIntersectionMocking, setupIntersectionMocking } from "react-intersection-observer/test-utils";
import { afterEach, beforeEach, rstest } from "@rstest/core";

beforeEach(() => {
    setupIntersectionMocking(rstest.fn);
});

afterEach(() => {
    resetIntersectionMocking();
});
