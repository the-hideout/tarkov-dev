import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import equal from "fast-deep-equal";

import doFetchQuests from "./do-fetch-quests.mjs";
import { langCode, useLangCode } from "../../modules/lang-helpers.js";
import { windowHasFocus } from "../../modules/window-focus-handler.mjs";
import { setDataLoading, setDataLoaded } from "../settings/settingsSlice.mjs";
import useTradersData from "../traders/index.js";
import useItemsData from "../items/index.js";

const initialState = {
    data: {
        achievements: [],
        prestige: [],
        tasks: [],
    },
    status: "idle",
    error: null,
};

export const fetchQuests = createAsyncThunk("quests/fetchQuests", (arg, { getState }) => {
    const state = getState();
    const gameMode = state.settings.gameMode;
    return doFetchQuests({ language: langCode(), gameMode });
});
const questsSlice = createSlice({
    name: "quests",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchQuests.pending, (state, action) => {
            state.status = "loading";
        });
        builder.addCase(fetchQuests.fulfilled, (state, action) => {
            state.status = "succeeded";

            if (!equal(state.data, action.payload)) {
                state.data = action.payload;
            }
        });
        builder.addCase(fetchQuests.rejected, (state, action) => {
            state.status = "failed";
            console.log(action.error);
            state.error = action.payload;
        });
    },
});

export const questsReducer = questsSlice.reducer;

const selectQuests = (state) => state.quests.data.tasks;
//const selectPrestige = state => state.quests.data.prestige;
const selectTraders = (state) => state.traders.data;
const selectItems = (state) => state.items.data;
const selectSettings = (state) => state.settings;

export const selectQuestsWithActive = createSelector(
    [selectQuests, selectTraders, selectItems, selectSettings],
    (quests, traders, items, settings) => {
        const questStatus = {
            complete: (id) => {
                return settings[settings.gameMode].completedQuests.includes(id);
            },
            failed: (id) => {
                return settings[settings.gameMode].failedQuests.includes(id);
            },
            active: (id) => {
                if (!settings[settings.gameMode].useTarkovTracker) {
                    return true;
                }
                if (questStatus.complete(id)) {
                    return false;
                }
                if (questStatus.failed(id)) {
                    return false;
                }
                const quest = quests.find((q) => q.id === id);
                if (!quest) {
                    return false;
                }
                if (settings[settings.gameMode].playerLevel < quest.minPlayerLevel) {
                    return false;
                }
                if (
                    quest.factionName !== "Any" &&
                    settings[settings.gameMode].pmcFaction !== "NONE" &&
                    settings[settings.gameMode].pmcFaction !== quest.factionName
                ) {
                    return false;
                }
                for (const req of quest.taskRequirements) {
                    let reqSatisfied = false;
                    if (!req) {
                        return true;
                    }
                    for (const status of req.status) {
                        if (!questStatus[status]) {
                            console.log(`Unrecognized task status: ${status}`);
                            continue;
                        }
                        if (questStatus[status](req.task.id)) {
                            reqSatisfied = true;
                            break;
                        }
                    }
                    if (!reqSatisfied) {
                        return false;
                    }
                }
                for (const req of quest.traderRequirements.filter((req) => req.requirementType === "level")) {
                    const trader = traders.find((t) => t.id === req.trader.id);
                    if (!trader) {
                        return false;
                    }
                    if (settings[settings.gameMode][trader.normalizedName] < req.value) {
                        //return false;
                    }
                }
                return true;
            },
        };

        return quests.map((q) => {
            const quest = { ...q };
            quest.trader = {
                id: quest.trader.id,
                name: traders.find((t) => t.id === quest.trader.id)?.name,
                normalizedName: traders.find((t) => t.id === quest.trader.id)?.normalizedName,
            };
            quest.objectives = quest.objectives
                .map((o) => {
                    if (!o) {
                        return false;
                    }
                    const obj = { ...o };
                    obj.complete = settings[settings.gameMode].objectivesCompleted?.includes(obj.id) || false;
                    if (obj.containsCategory) {
                        obj.containsCategory = obj.containsCategory.map((c) => {
                            const cat = { ...c };
                            cat.name = items.handbook.itemCategories?.[cat.id]?.name;
                            cat.normalizedName = items.handbook.itemCategories?.[cat.id]?.normalizedName;
                            return cat;
                        });
                    }
                    return obj;
                })
                .filter(Boolean);
            quest.active = questStatus.active(quest.id);
            const rewardKeys = ["startRewards", "finishRewards", "failureOutcome"];
            for (const rewardKey of rewardKeys) {
                quest[rewardKey] = { ...quest[rewardKey] };
                quest[rewardKey].skillLevelReward = quest[rewardKey].skillLevelReward.map((r) => {
                    const rew = { ...r };
                    rew.name = items.handbook.skills?.find((skill) => skill.id === rew.skill)?.name ?? rew.skill;
                    return rew;
                });
            }
            return quest;
        });
    },
);

let fetchedLang = false;
let fetchedGameMode = false;
let refreshInterval = false;

const clearRefreshInterval = () => {
    clearInterval(refreshInterval);
    refreshInterval = false;
};

export function useAchievementsData() {
    const dispatch = useDispatch();
    const { data, status, error } = useSelector((state) => state.quests);
    const lang = useLangCode();
    const gameMode = useSelector((state) => state.settings.gameMode);

    useEffect(() => {
        const dataName = "achievements";
        if (status === "idle") {
            return;
        } else if (status === "loading") {
            dispatch(setDataLoading(dataName));
        } else {
            dispatch(setDataLoaded(dataName));
        }
    }, [status, dispatch]);

    useEffect(() => {
        if (fetchedLang !== lang || fetchedGameMode !== gameMode) {
            fetchedLang = lang;
            fetchedGameMode = gameMode;
            dispatch(fetchQuests());
            clearRefreshInterval();
        }
        if (!refreshInterval) {
            refreshInterval = setInterval(() => {
                if (!windowHasFocus) {
                    return;
                }
                dispatch(fetchQuests());
            }, 600000);
        }
        return () => {
            clearRefreshInterval();
        };
    }, [dispatch, lang, gameMode]);

    return { data: data.achievements, status, error };
}

export const usePrestigeData = () => {
    const dispatch = useDispatch();
    const { data, status, error } = useSelector((state) => state.quests);
    const lang = useLangCode();
    const gameMode = useSelector((state) => state.settings.gameMode);

    useEffect(() => {
        const dataName = "quests";
        if (status === "idle") {
            return;
        } else if (status === "loading") {
            dispatch(setDataLoading(dataName));
        } else {
            dispatch(setDataLoaded(dataName));
        }
    }, [status, dispatch]);

    useEffect(() => {
        if (fetchedLang !== lang || fetchedGameMode !== gameMode) {
            fetchedLang = lang;
            fetchedGameMode = gameMode;
            dispatch(fetchQuests());
            clearRefreshInterval();
        }
        if (!refreshInterval) {
            refreshInterval = setInterval(() => {
                if (!windowHasFocus) {
                    return;
                }
                dispatch(fetchQuests());
            }, 600000);
        }
        return () => {
            clearRefreshInterval();
        };
    }, [dispatch, lang, gameMode]);

    return { data: data.prestige, status, error };
};

export default function useQuestsData() {
    const dispatch = useDispatch();
    const { status, error } = useSelector((state) => state.quests);
    const data = useSelector(selectQuestsWithActive);
    const lang = useLangCode();
    const gameMode = useSelector((state) => state.settings.gameMode);

    useEffect(() => {
        const dataName = "quests";
        if (status === "idle") {
            return;
        } else if (status === "loading") {
            dispatch(setDataLoading(dataName));
        } else {
            dispatch(setDataLoaded(dataName));
        }
    }, [status, dispatch]);

    useEffect(() => {
        if (fetchedLang !== lang || fetchedGameMode !== gameMode) {
            fetchedLang = lang;
            fetchedGameMode = gameMode;
            dispatch(fetchQuests());
            clearRefreshInterval();
        }
        if (!refreshInterval) {
            refreshInterval = setInterval(() => {
                if (!windowHasFocus) {
                    return;
                }
                dispatch(fetchQuests());
            }, 600000);
        }
        return () => {
            clearRefreshInterval();
        };
    }, [dispatch, lang, gameMode]);

    return { data, status, error };
}
