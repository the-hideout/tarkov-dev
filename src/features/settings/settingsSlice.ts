import { createAsyncThunk, createSelector, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { z } from "zod";
import type { RootState } from "#src/store";
import { localStorageReadJson, localStorageWriteJson } from "#src/utils/local-storage";
import type {
    GameMode,
    GameModeSettings,
    LevelSettingKey,
    LoadingStatus,
    PlayerPosition,
    StationKey,
    TarkovTrackerDomain,
} from "#src/types/settings";
import {
    gameModeSchema,
    gameModeSettingsSchema,
    parseGameModeSettings,
    playerPositionSchema,
    stationKeySchema,
    tarkovTrackerDomainSchema,
    tarkovTrackerResponseSchema,
} from "./contracts";

export function localStorageReadJsonGameMode<K extends keyof GameModeSettings>(
    key: K,
    defaultValue: GameModeSettings[K],
): GameModeSettings[K] {
    const gameMode = localStorageReadJson("gameMode", "regular", gameModeSchema);
    const stored = localStorageReadJson(`${gameMode}Settings`, {}, z.record(z.string(), z.unknown()));
    return Object.prototype.hasOwnProperty.call(stored, key) ? parseGameModeSettings(stored)[key] : defaultValue;
}

export function localStorageWriteJsonGameMode<K extends keyof GameModeSettings>(
    key: K,
    value: GameModeSettings[K],
): void {
    const gameMode = localStorageReadJson("gameMode", "regular", gameModeSchema);
    const stored = localStorageReadJson(`${gameMode}Settings`, {}, z.record(z.string(), z.unknown()));
    const settings = parseGameModeSettings({ ...stored, [key]: value });
    localStorageWriteJson(`${gameMode}Settings`, settings);
}

export interface SettingsState {
    "progressStatus": LoadingStatus;
    "status": LoadingStatus;
    "error": string | null;
    "regular": GameModeSettings;
    "pve": GameModeSettings;
    "pvp-season": GameModeSettings;
    "hideRemoteControl": boolean;
    "playerPosition": PlayerPosition | null;
    "gameMode": GameMode;
    "Ti": number;
    "Tr": number;
    "fleaEnabled": boolean;
    "tarkovTrackerDomain": TarkovTrackerDomain;
    "loadingData": string;
}

interface SettingsThunkState {
    settings: SettingsState;
    hideout: {
        data: { normalizedName: string; levels: { id: string; level: number }[] }[];
    };
}

export interface TarkovTrackerProgress {
    gameMode: GameMode;
    domain: TarkovTrackerDomain;
    playerLevel: number;
    pmcFaction: GameModeSettings["pmcFaction"];
    hideout: Partial<Record<StationKey, number>>;
    quests: string[];
    questsFailed: string[];
    objectivesCompleted: string[];
    objectivesCompletionProgress: Record<string, number>;
}

export function createInitialSettingsState(): SettingsState {
    const legacySettings = parseGameModeSettings(
        Object.fromEntries(
            Object.keys(gameModeSettingsSchema.shape).map((key) => [
                key,
                localStorageReadJson(key, undefined, z.unknown()),
            ]),
        ),
    );
    const readMode = (mode: GameMode, defaults: GameModeSettings) =>
        parseGameModeSettings(localStorageReadJson(`${mode}Settings`, {}, z.record(z.string(), z.unknown())), defaults);
    return {
        "progressStatus": "idle",
        "status": "idle",
        "error": null,
        "regular": readMode("regular", legacySettings),
        "pve": readMode("pve", { ...legacySettings, tarkovTrackerAPIKey: "", useTarkovTracker: false }),
        "pvp-season": readMode("pvp-season", legacySettings),
        "hideRemoteControl": localStorageReadJson("hide-remote-control", false, z.boolean()),
        "playerPosition": localStorageReadJson("playerPosition", null, playerPositionSchema.nullable()),
        "gameMode": localStorageReadJson("gameMode", "regular", gameModeSchema),
        "Ti": localStorageReadJson("Ti", 0.03, z.number().nonnegative()),
        "Tr": localStorageReadJson("Tr", 0.03, z.number().nonnegative()),
        "fleaEnabled": localStorageReadJson("fleaEnabled", true, z.boolean()),
        "tarkovTrackerDomain": localStorageReadJson(
            "tarkovTrackerDomain",
            "tarkovtracker.org",
            tarkovTrackerDomainSchema,
        ),
        "loadingData": "",
    };
}

const persistCurrentGameModeSettings = (state: SettingsState) => {
    localStorageWriteJson(`${state.gameMode}Settings`, state[state.gameMode]);
};

export const fetchTarkovTrackerProgress = createAsyncThunk<
    TarkovTrackerProgress | false,
    string,
    { state: SettingsThunkState; fulfilledMeta: { etag: string | null } }
>("settings/fetchTarkovTrackerProgress", async (apiKey, { getState, signal, fulfillWithValue }) => {
    const { gameMode, tarkovTrackerDomain: domain } = getState().settings;
    const validators: Record<TarkovTrackerDomain, RegExp> = {
        "tarkovtracker.io": /^[a-zA-Z0-9]{22}$/,
        "tarkovtracker.org": /^(?:[A-Z]{3}_).+$/i,
    };
    if (!validators[domain].test(apiKey)) {
        return fulfillWithValue(false as const, { etag: null });
    }

    const response = await fetch(`https://api.${domain}/progress`, {
        method: "GET",
        headers: { Authorization: `Bearer ${apiKey}` },
        signal,
    });
    if (!response.ok) {
        throw new Error(`TarkovTracker request failed (${response.status})`);
    }
    const rawResponse: unknown = await response.json();
    const { data: progress } = tarkovTrackerResponseSchema.parse(rawResponse);
    const result: TarkovTrackerProgress = {
        gameMode,
        domain,
        playerLevel: progress.playerLevel,
        pmcFaction: progress.pmcFaction,
        hideout: {},
        quests: progress.tasksProgress.filter((task) => task.complete).map((task) => task.id),
        questsFailed: progress.tasksProgress.filter((task) => task.invalid || task.failed).map((task) => task.id),
        objectivesCompleted: progress.taskObjectivesProgress
            .filter((objective) => objective.complete)
            .map((objective) => objective.id),
        objectivesCompletionProgress: Object.fromEntries(
            progress.taskObjectivesProgress
                .filter((objective) => !objective.complete && (objective.count ?? 0) > 0)
                .map((objective) => [objective.id, objective.count ?? 0]),
        ),
    };
    const completeModules = new Set(
        progress.hideoutModulesProgress.filter((module) => module.complete).map((module) => module.id),
    );
    for (const station of getState().hideout.data) {
        const key = stationKeySchema.safeParse(station.normalizedName);
        if (!key.success) {
            continue;
        }
        result.hideout[key.data] = Math.max(
            0,
            ...station.levels.filter((level) => completeModules.has(level.id)).map((level) => level.level),
        );
    }
    return fulfillWithValue(result, { etag: response.headers.get("etag") });
});

const settingsSlice = createSlice({
    name: "settings",
    initialState: createInitialSettingsState,
    reducers: {
        setTarkovTrackerAPIKey: (state, action: PayloadAction<string>) => {
            state[state.gameMode].tarkovTrackerAPIKey = action.payload;
            persistCurrentGameModeSettings(state);
        },
        setPlayerLevel: (state, action: PayloadAction<number>) => {
            state[state.gameMode].playerLevel = action.payload;
            persistCurrentGameModeSettings(state);
        },
        setMinDogtagLevel: (state, action: PayloadAction<number>) => {
            state[state.gameMode].minDogtagLevel = action.payload;
            persistCurrentGameModeSettings(state);
        },
        toggleHideDogtagBarters: (state, action: PayloadAction<boolean>) => {
            state[state.gameMode].hideDogtagBarters = action.payload;
            persistCurrentGameModeSettings(state);
        },
        setStationOrTraderLevel: (state, action: PayloadAction<{ target: LevelSettingKey; value: number }>) => {
            state[state.gameMode][action.payload.target] = action.payload.value;
            persistCurrentGameModeSettings(state);
        },
        toggleTarkovTracker: (state, action: PayloadAction<boolean>) => {
            state[state.gameMode].useTarkovTracker = action.payload;
            persistCurrentGameModeSettings(state);
        },
        toggleHideRemoteControl: (state) => {
            state.hideRemoteControl = !state.hideRemoteControl;
            localStorageWriteJson("hide-remote-control", state.hideRemoteControl);
        },
        setPlayerPosition: (state, action: PayloadAction<PlayerPosition | null>) => {
            state.playerPosition = action.payload;
            localStorageWriteJson("playerPosition", action.payload);
        },
        setGameMode: (state, action: PayloadAction<GameMode>) => {
            state.gameMode = action.payload;
            localStorageWriteJson("gameMode", action.payload);
        },
        setFleaMarketFactors: (state, action: PayloadAction<{ Ti: number; Tr: number }>) => {
            state.Ti = action.payload.Ti;
            state.Tr = action.payload.Tr;
            localStorageWriteJson("Ti", action.payload.Ti);
            localStorageWriteJson("Tr", action.payload.Tr);
        },
        setTarkovTrackerDomain: (state, action: PayloadAction<TarkovTrackerDomain>) => {
            if (state.tarkovTrackerDomain === action.payload) {
                return;
            }
            state.tarkovTrackerDomain = action.payload;
            localStorageWriteJson("tarkovTrackerDomain", action.payload);
            for (const mode of gameModeSchema.options) {
                state[mode].tarkovTrackerAPIKey = "";
                localStorageWriteJson(`${mode}Settings`, state[mode]);
            }
        },
        setDataLoading: (state, action: PayloadAction<string>) => {
            const loading = state.loadingData.split(",").filter(Boolean);
            if (!loading.includes(action.payload)) {
                loading.push(action.payload);
                state.loadingData = loading.join(",");
            }
        },
        setDataLoaded: (state, action: PayloadAction<string>) => {
            state.loadingData = state.loadingData
                .split(",")
                .filter((entry) => entry !== action.payload)
                .join(",");
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchTarkovTrackerProgress.pending, (state) => {
            state.progressStatus = "loading";
            state.status = "loading";
            state.error = null;
        });
        builder.addCase(fetchTarkovTrackerProgress.fulfilled, (state, action) => {
            state.progressStatus = "succeeded";
            state.status = "succeeded";
            state.error = null;
            const progress = action.payload;
            if (
                !progress ||
                progress.domain !== state.tarkovTrackerDomain ||
                state[progress.gameMode].tarkovTrackerAPIKey !== action.meta.arg
            ) {
                return;
            }
            const settings = state[progress.gameMode];
            settings.completedQuests = progress.quests;
            settings.failedQuests = progress.questsFailed;
            settings.objectivesCompleted = progress.objectivesCompleted;
            settings.objectivesCompletionProgress = progress.objectivesCompletionProgress;
            settings.playerLevel = progress.playerLevel;
            settings.pmcFaction = progress.pmcFaction;
            Object.assign(settings, progress.hideout);
            localStorageWriteJson(`${progress.gameMode}Settings`, settings);
        });
        builder.addCase(fetchTarkovTrackerProgress.rejected, (state, action) => {
            state.progressStatus = "failed";
            state.status = "failed";
            state.error = action.error.message ?? "Unable to load TarkovTracker progress";
        });
    },
});

// Only the current game mode's settings, so changes elsewhere in settings (like loadingData,
// which changes on every data refresh) don't give these selectors new results
const selectGameModeSettings = (state: RootState) => state.settings[state.settings.gameMode];

export const selectAllTraders = createSelector([selectGameModeSettings], (mode) => {
    return {
        prapor: mode.prapor,
        therapist: mode.therapist,
        fence: mode.fence,
        skier: mode.skier,
        peacekeeper: mode.peacekeeper,
        mechanic: mode.mechanic,
        ragman: mode.ragman,
        jaeger: mode.jaeger,
        ref: mode.ref,
    };
});

export const selectAllStations = createSelector([selectGameModeSettings], (mode) => {
    return {
        "bitcoin-farm": mode["bitcoin-farm"],
        "booze-generator": mode["booze-generator"],
        "christmas-tree": mode["christmas-tree"],
        "intelligence-center": mode["intelligence-center"],
        "lavatory": mode.lavatory,
        "medstation": mode.medstation,
        "nutrition-unit": mode["nutrition-unit"],
        "water-collector": mode["water-collector"],
        "workbench": mode.workbench,
        "solar-power": mode["solar-power"],
    };
});

export const selectAllSkills = createSelector([selectGameModeSettings], (mode) => {
    return {
        "crafting": mode.crafting,
        "hideout-management": mode["hideout-management"],
        "metabolism": mode.metabolism,
    };
});

export const selectCompletedQuests = createSelector([selectGameModeSettings], (mode) => mode.completedQuests);

export const {
    setTarkovTrackerAPIKey,
    setPlayerLevel,
    setMinDogtagLevel,
    setStationOrTraderLevel,
    toggleTarkovTracker,
    toggleHideRemoteControl,
    toggleHideDogtagBarters,
    setPlayerPosition,
    setGameMode,
    setFleaMarketFactors,
    setTarkovTrackerDomain,
    setDataLoading,
    setDataLoaded,
} = settingsSlice.actions;

export default settingsSlice.reducer;
