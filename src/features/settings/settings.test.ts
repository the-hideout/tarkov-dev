import { afterEach, beforeEach, describe, expect, it, rstest } from "@rstest/core";
import { configureStore } from "@reduxjs/toolkit";
import { z } from "zod";
import settingsReducer, {
    createInitialSettingsState,
    fetchTarkovTrackerProgress,
    localStorageReadJsonGameMode,
    localStorageWriteJsonGameMode,
    setGameMode,
    setMinDogtagLevel,
    setPlayerLevel,
    setPlayerPosition,
    setStationOrTraderLevel,
    setTarkovTrackerAPIKey,
    setTarkovTrackerDomain,
} from "./settingsSlice";
import {
    gameModeSchema,
    parseGameModeSettings,
    parseLevelInput,
    playerPositionSchema,
    tarkovTrackerResponseSchema,
} from "./contracts";
import { localStorageReadJson } from "#src/utils/local-storage";
import type { GameModeSettings } from "#src/types/settings";

beforeEach(() => localStorage.clear());
afterEach(() => {
    rstest.unstubAllGlobals();
});

const trackerResponse = {
    data: {
        playerLevel: 42,
        pmcFaction: "USEC",
        tasksProgress: [
            { id: "complete-task", complete: true },
            { id: "failed-task", failed: true },
            { id: "invalid-task", invalid: true },
            { id: "open-task" },
        ],
        taskObjectivesProgress: [
            { id: "complete-objective", complete: true, count: 3 },
            { id: "partial-objective", count: 2 },
            { id: "open-objective" },
        ],
        hideoutModulesProgress: [
            { id: "workbench-1", complete: true },
            { id: "workbench-3", complete: true },
            { id: "generator-2", complete: true },
            { id: "library-1", complete: false },
        ],
    },
};

function trackerStore() {
    return configureStore({
        reducer: {
            settings: settingsReducer,
            hideout: () => ({
                data: [
                    {
                        normalizedName: "workbench",
                        levels: [
                            { id: "workbench-1", level: 1 },
                            { id: "workbench-3", level: 3 },
                        ],
                    },
                    { normalizedName: "generator", levels: [{ id: "generator-2", level: 2 }] },
                    { normalizedName: "library", levels: [{ id: "library-1", level: 1 }] },
                ],
            }),
        },
    });
}

describe("persisted settings", () => {
    it("normalizes historical strings while retaining valid fields in partial mode settings", () => {
        localStorage.setItem("prapor", '"2"');
        localStorage.setItem("tarkovTrackerAPIKey", '"API_legacy"');
        localStorage.setItem("useTarkovTracker", "true");
        localStorage.setItem(
            "regularSettings",
            JSON.stringify({
                playerLevel: "15",
                minDogtagLevel: "23",
                workbench: "2",
                generator: 2,
                completedQuests: ["quest"],
                unknownSetting: true,
            }),
        );
        const state = createInitialSettingsState();
        expect(state.regular.playerLevel).toBe(15);
        expect(state.regular.minDogtagLevel).toBe(23);
        expect(state.regular.workbench).toBe(2);
        expect(state.regular.generator).toBe(2);
        expect(state.regular.prapor).toBe(2);
        expect(state.regular.completedQuests).toEqual(["quest"]);
        expect(state.regular).not.toHaveProperty("unknownSetting");
        expect(state.regular.tarkovTrackerAPIKey).toBe("API_legacy");
        expect(state.pve.tarkovTrackerAPIKey).toBe("");
        expect(state.pve.useTarkovTracker).toBe(false);
    });

    it.each(["null", "{broken", "[]", '"invalid"'])("recovers a malformed settings object %s", (value) => {
        localStorage.setItem("regularSettings", value);
        const settings = settingsReducer(undefined, { type: "init" }).regular;
        expect(settings.playerLevel).toBe(72);
        expect(settings.minDogtagLevel).toBe(1);
        expect(settings.workbench).toBe(3);
        expect(settings.completedQuests).toEqual([]);
    });

    it.each([null, "", "abc", "15x", "1.5", "Infinity", 0, -1, 1.5, 80, Number.POSITIVE_INFINITY])(
        "defaults invalid persisted player and dogtag levels %s",
        (value) => {
            const settings = parseGameModeSettings({ playerLevel: value, minDogtagLevel: value, prapor: 2 });
            expect(settings.playerLevel).toBe(72);
            expect(settings.minDogtagLevel).toBe(1);
            expect(settings.prapor).toBe(2);
        },
    );

    it("recovers individual corrupted values and keeps another mode isolated", () => {
        localStorage.setItem(
            "regularSettings",
            JSON.stringify({ playerLevel: 15, completedQuests: null, workbench: -2, useTarkovTracker: "true" }),
        );
        localStorage.setItem("pveSettings", JSON.stringify({ playerLevel: 79, minDogtagLevel: 40 }));
        localStorage.setItem("gameMode", '"unsupported"');
        localStorage.setItem("Ti", "null");
        const state = createInitialSettingsState();
        expect(state.regular.playerLevel).toBe(15);
        expect(state.regular.completedQuests).toEqual([]);
        expect(state.regular.workbench).toBe(3);
        expect(state.regular.useTarkovTracker).toBe(false);
        expect(state.pve.playerLevel).toBe(79);
        expect(state.gameMode).toBe("regular");
        expect(state.Ti).toBe(0.03);
    });

    it("writes numerical levels only to the selected mode", () => {
        let state = settingsReducer(undefined, setPlayerLevel(15));
        state = settingsReducer(state, setGameMode("pve"));
        state = settingsReducer(state, setPlayerLevel(30));
        state = settingsReducer(state, setMinDogtagLevel(10));
        state = settingsReducer(state, setStationOrTraderLevel({ target: "generator", value: 2 }));
        expect(state.regular.playerLevel).toBe(15);
        expect(state.pve.playerLevel).toBe(30);
        expect(state.pve.minDogtagLevel).toBe(10);
        expect(state.pve.generator).toBe(2);
        expect(state.regular.generator).toBe(0);
        expect(createInitialSettingsState().pve.playerLevel).toBe(30);
        expect(localStorage.getItem("regularSettings")).toContain('"playerLevel":15');
    });

    it("clears and persists all mode tokens when the tracker service changes", () => {
        let state = createInitialSettingsState();
        for (const mode of gameModeSchema.options) {
            state = settingsReducer(state, setGameMode(mode));
            state = settingsReducer(state, setTarkovTrackerAPIKey(`API_${mode}`));
        }
        state = settingsReducer(state, setTarkovTrackerDomain("tarkovtracker.io"));
        const restored = createInitialSettingsState();
        for (const mode of gameModeSchema.options) {
            expect(state[mode].tarkovTrackerAPIKey).toBe("");
            expect(restored[mode].tarkovTrackerAPIKey).toBe("");
        }
        expect(restored.tarkovTrackerDomain).toBe("tarkovtracker.io");
    });

    it("can initialize a missing or null mode object through the storage writer", () => {
        localStorage.setItem("gameMode", '"pve"');
        localStorage.setItem("pveSettings", "null");
        localStorageWriteJsonGameMode("intelligence-center", 2);
        expect(localStorageReadJsonGameMode("intelligence-center", 3)).toBe(2);
        expect(createInitialSettingsState().pve["intelligence-center"]).toBe(2);
        expect(createInitialSettingsState().regular["intelligence-center"]).toBe(3);
        localStorage.setItem("Ti", '"invalid"');
        expect(localStorageReadJson("Ti", 0.03, z.number())).toBe(0.03);
    });
});

describe("numeric input parsing", () => {
    it.each([
        ["15", 15],
        [" 23 ", 23],
        ["01", 1],
        ["79", 79],
    ])("parses %s", (input, expected) => {
        expect(parseLevelInput(String(input))).toBe(expected);
    });
    it.each(["", " ", "-1", "0", "80", "1.5", "1e1", "1a", "Infinity", "NaN"])("rejects %s", (input) => {
        expect(parseLevelInput(input)).toBeUndefined();
    });
});

describe("player positions", () => {
    it("accepts nullable maps and absent rotation and persists clear actions", () => {
        const position = playerPositionSchema.parse({ map: null, position: { x: 1, y: -2.5, z: 0 } });
        let state = settingsReducer(undefined, setPlayerPosition(position));
        expect(state.playerPosition).toEqual(position);
        expect(createInitialSettingsState().playerPosition).toEqual(position);
        state = settingsReducer(state, setPlayerPosition(null));
        expect(state.playerPosition).toBeNull();
        expect(createInitialSettingsState().playerPosition).toBeNull();
    });
    it.each([
        { map: "woods", position: { x: 1, y: 2 } },
        { map: "woods", position: { x: "1", y: 2, z: 3 } },
        { map: "woods", position: { x: Infinity, y: 2, z: 3 } },
        { map: "woods", position: { x: 1, y: 2, z: 3 }, rotation: NaN },
    ])("rejects malformed position %#", (position) => {
        expect(playerPositionSchema.safeParse(position).success).toBe(false);
        localStorage.setItem("playerPosition", JSON.stringify(position));
        expect(createInitialSettingsState().playerPosition).toBeNull();
    });
});

describe("TarkovTracker progress", () => {
    it("sets loading immediately and saves completed progress with all supported station keys", async () => {
        const store = trackerStore();
        store.dispatch(setTarkovTrackerAPIKey("API_token"));
        rstest.stubGlobal(
            "fetch",
            rstest.fn(async () => new Response(JSON.stringify(trackerResponse))),
        );
        const request = store.dispatch(fetchTarkovTrackerProgress("API_token"));
        expect(store.getState().settings.progressStatus).toBe("loading");
        await request;
        const state = store.getState().settings;
        expect(state.progressStatus).toBe("succeeded");
        expect(state.error).toBeNull();
        expect(state.regular.playerLevel).toBe(42);
        expect(state.regular.pmcFaction).toBe("USEC");
        expect(state.regular.completedQuests).toEqual(["complete-task"]);
        expect(state.regular.failedQuests).toEqual(["failed-task", "invalid-task"]);
        expect(state.regular.objectivesCompleted).toEqual(["complete-objective"]);
        expect(state.regular.objectivesCompletionProgress).toEqual({ "partial-objective": 2 });
        expect(state.regular.workbench).toBe(3);
        expect(state.regular.generator).toBe(2);
        expect(state.regular.library).toBe(0);
        expect(createInitialSettingsState().regular.generator).toBe(2);
    });

    it("uses the request mode if the active game mode changes before completion", async () => {
        const store = trackerStore();
        store.dispatch(setTarkovTrackerAPIKey("API_token"));
        rstest.stubGlobal(
            "fetch",
            rstest.fn(async () => new Response(JSON.stringify(trackerResponse))),
        );
        const request = store.dispatch(fetchTarkovTrackerProgress("API_token"));
        store.dispatch(setGameMode("pve"));
        await request;
        expect(store.getState().settings.regular.playerLevel).toBe(42);
        expect(store.getState().settings.pve.playerLevel).toBe(72);
    });

    it("ignores progress from a token cleared during the request", async () => {
        const store = trackerStore();
        store.dispatch(setTarkovTrackerAPIKey("API_token"));
        rstest.stubGlobal(
            "fetch",
            rstest.fn(async () => new Response(JSON.stringify(trackerResponse))),
        );
        const request = store.dispatch(fetchTarkovTrackerProgress("API_token"));
        store.dispatch(setTarkovTrackerDomain("tarkovtracker.io"));
        await request;
        expect(store.getState().settings.regular.playerLevel).toBe(72);
    });

    it("reports network failures from action.error and preserves existing progress", async () => {
        const store = trackerStore();
        store.dispatch(setPlayerLevel(15));
        rstest.stubGlobal(
            "fetch",
            rstest.fn(async () => {
                throw new Error("Network unavailable");
            }),
        );
        await store.dispatch(fetchTarkovTrackerProgress("API_token"));
        expect(store.getState().settings.progressStatus).toBe("failed");
        expect(store.getState().settings.error).toBe("Network unavailable");
        expect(store.getState().settings.regular.playerLevel).toBe(15);
    });

    it("rejects HTTP failures and malformed responses", async () => {
        const store = trackerStore();
        rstest.stubGlobal(
            "fetch",
            rstest.fn(async () => new Response("{}", { status: 403 })),
        );
        await store.dispatch(fetchTarkovTrackerProgress("API_token"));
        expect(store.getState().settings.error).toContain("403");
        rstest.stubGlobal(
            "fetch",
            rstest.fn(
                async () => new Response(JSON.stringify({ data: { ...trackerResponse.data, playerLevel: "15" } })),
            ),
        );
        await store.dispatch(fetchTarkovTrackerProgress("API_token"));
        expect(store.getState().settings.progressStatus).toBe("failed");
        expect(store.getState().settings.error).toBeTypeOf("string");
        expect(store.getState().settings.regular.playerLevel).toBe(72);
        expect(tarkovTrackerResponseSchema.safeParse({ data: null }).success).toBe(false);
    });

    it("does not request progress for an empty or invalid token", async () => {
        const store = trackerStore();
        const fetch = rstest.fn();
        rstest.stubGlobal("fetch", fetch);
        await store.dispatch(fetchTarkovTrackerProgress(""));
        await store.dispatch(fetchTarkovTrackerProgress("invalid"));
        expect(fetch).not.toHaveBeenCalled();
        expect(store.getState().settings.progressStatus).toBe("succeeded");
        expect(store.getState().settings.regular.playerLevel).toBe(72);
    });
});

type Assert<T extends true> = T;
type Rejects<Input, Payload> = Input extends Payload ? false : true;

export type SettingsActionContracts = [
    Assert<Rejects<string, Parameters<typeof setPlayerLevel>[0]>>,
    Assert<Rejects<string, Parameters<typeof setMinDogtagLevel>[0]>>,
    Assert<Rejects<{ target: "playerLevel"; value: number }, Parameters<typeof setStationOrTraderLevel>[0]>>,
    Assert<Rejects<{ target: "misspelled-station"; value: number }, Parameters<typeof setStationOrTraderLevel>[0]>>,
    Assert<Rejects<{ target: "workbench"; value: string }, Parameters<typeof setStationOrTraderLevel>[0]>>,
    Assert<
        Rejects<{ map: string; position: { x: string; y: number; z: number } }, Parameters<typeof setPlayerPosition>[0]>
    >,
    Assert<Rejects<{ map: string; position: { x: number; y: number } }, Parameters<typeof setPlayerPosition>[0]>>,
    Assert<Rejects<string, keyof GameModeSettings>>,
];
