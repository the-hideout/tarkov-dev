import { configureStore } from "@reduxjs/toolkit";
import { afterEach, beforeEach, expect, it, rstest } from "@rstest/core";
import { startProgressPolling } from "./progressPolling.mjs";
import settings, { fetchTarkovTrackerProgress } from "#src/features/settings/settingsSlice";

const minute = 60_000;
const apiKey = "PVP_example";
let stop;
let focused;

beforeEach(() => {
    rstest.useFakeTimers();
    rstest.setSystemTime(0);
    focused = true;
    rstest.spyOn(document, "hasFocus").mockImplementation(() => focused);
    rstest.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
});

afterEach(() => {
    stop?.();
    stop = undefined;
    rstest.useRealTimers();
    rstest.restoreAllMocks();
    rstest.unstubAllGlobals();
});

function progressResponse(etag, playerLevel) {
    return new Response(
        JSON.stringify({
            data: {
                tasksProgress: [],
                taskObjectivesProgress: [],
                hideoutModulesProgress: [],
                playerLevel,
                pmcFaction: "USEC",
            },
        }),
        { headers: etag ? { ETag: etag } : {} },
    );
}

function testStore() {
    const initial = settings(undefined, { type: "@@test/init" });
    return configureStore({
        reducer: { settings, hideout: () => ({ data: [] }) },
        preloadedState: {
            settings: {
                ...initial,
                gameMode: "regular",
                regular: {
                    ...initial.regular,
                    useTarkovTracker: true,
                    tarkovTrackerAPIKey: apiKey,
                },
            },
        },
    });
}

it("makes five requests in the first focused hour of unchanged progress", async () => {
    const times = [];
    const fetchProgress = rstest.fn(async () => {
        times.push(Date.now() / minute);
        return progressResponse('W/"unchanged"', 12);
    });
    rstest.stubGlobal("fetch", fetchProgress);
    const store = testStore();
    stop = startProgressPolling(() => store.dispatch(fetchTarkovTrackerProgress(apiKey)));

    await rstest.advanceTimersByTimeAsync(60 * minute - 1);

    expect(times).toEqual([0, 5, 15, 30, 45]);
    expect(store.getState().settings.regular.playerLevel).toBe(12);
    expect(fetchProgress.mock.calls[0][1].headers).toEqual({ Authorization: "Bearer PVP_example" });
});

it("applies new progress and returns to five-minute polling", async () => {
    const fetchProgress = rstest
        .fn()
        .mockImplementationOnce(async () => progressResponse('W/"first"', 12))
        .mockImplementationOnce(async () => progressResponse('W/"first"', 12))
        .mockImplementation(async () => progressResponse('W/"changed"', 13));
    rstest.stubGlobal("fetch", fetchProgress);
    const store = testStore();
    stop = startProgressPolling(() => store.dispatch(fetchTarkovTrackerProgress(apiKey)));

    await rstest.advanceTimersByTimeAsync(15 * minute);
    expect(fetchProgress).toHaveBeenCalledTimes(3);
    expect(store.getState().settings.regular.playerLevel).toBe(13);
    await rstest.advanceTimersByTimeAsync(5 * minute);
    expect(fetchProgress).toHaveBeenCalledTimes(4);
});

it("pauses while unfocused and refreshes once when the tab returns", async () => {
    const fetchProgress = rstest.fn(async () => progressResponse('W/"unchanged"', 12));
    rstest.stubGlobal("fetch", fetchProgress);
    const store = testStore();
    stop = startProgressPolling(() => store.dispatch(fetchTarkovTrackerProgress(apiKey)));
    await rstest.advanceTimersByTimeAsync(5 * minute);
    expect(fetchProgress).toHaveBeenCalledTimes(2);

    focused = false;
    window.dispatchEvent(new Event("blur"));
    await rstest.advanceTimersByTimeAsync(6 * minute);
    expect(fetchProgress).toHaveBeenCalledTimes(2);

    focused = true;
    window.dispatchEvent(new Event("focus"));
    document.dispatchEvent(new Event("visibilitychange"));
    expect(fetchProgress).toHaveBeenCalledTimes(3);
});

it("keeps the normal cadence when the backend does not expose an ETag", async () => {
    const fetchProgress = rstest.fn(async () => progressResponse(null, 12));
    rstest.stubGlobal("fetch", fetchProgress);
    const store = testStore();
    stop = startProgressPolling(() => store.dispatch(fetchTarkovTrackerProgress(apiKey)));

    await rstest.advanceTimersByTimeAsync(15 * minute);
    expect(fetchProgress).toHaveBeenCalledTimes(4);
});

it("allows only one in-flight request and aborts it when polling stops", async () => {
    const fetchProgress = rstest.fn(
        (_url, options) =>
            new Promise((_resolve, reject) => {
                options.signal.addEventListener("abort", () => reject(options.signal.reason), { once: true });
            }),
    );
    rstest.stubGlobal("fetch", fetchProgress);
    const store = testStore();
    stop = startProgressPolling(() => store.dispatch(fetchTarkovTrackerProgress(apiKey)));
    const { signal } = fetchProgress.mock.calls[0][1];

    await rstest.advanceTimersByTimeAsync(10_000);
    window.dispatchEvent(new Event("focus"));
    expect(fetchProgress).toHaveBeenCalledTimes(1);

    stop();
    stop = undefined;
    await rstest.advanceTimersByTimeAsync(20 * minute);
    expect(signal.aborted).toBe(true);
    expect(fetchProgress).toHaveBeenCalledTimes(1);
});

it("aborts a stalled read and retries at the normal cadence", async () => {
    const fetchProgress = rstest
        .fn()
        .mockImplementationOnce(
            (_url, options) =>
                new Promise((_resolve, reject) => {
                    options.signal.addEventListener("abort", () => reject(options.signal.reason), { once: true });
                }),
        )
        .mockImplementation(async () => progressResponse('W/"recovered"', 14));
    rstest.stubGlobal("fetch", fetchProgress);
    const store = testStore();
    stop = startProgressPolling(() => store.dispatch(fetchTarkovTrackerProgress(apiKey)));
    const { signal } = fetchProgress.mock.calls[0][1];

    await rstest.advanceTimersByTimeAsync(30_000);
    expect(signal.aborted).toBe(true);
    await rstest.advanceTimersByTimeAsync(5 * minute);
    expect(fetchProgress).toHaveBeenCalledTimes(2);
    expect(store.getState().settings.regular.playerLevel).toBe(14);
});
