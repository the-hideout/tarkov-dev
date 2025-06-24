import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';

export const fetchTarkovTrackerProgress = createAsyncThunk(
    'settings/fetchTarkovTrackerProgress',
    async (apiKey, { getState }) => {
        if (!apiKey || typeof apiKey !== 'string' || !apiKey.match(/^[a-zA-Z0-9]{22}$/)) {
            return false;
        }

        const returnData = {
            hasFlea: true,
            playerLevel: 72,
            pmcFaction: 'NONE',
            hideout: {},
            quests: [],
            questsFailed: [],
            objectives: [],
        };

        const domain = localStorageReadJson('tarkovTrackerDomain', 'tarkovtracker.io');

        const response = await fetch(
            `https://${domain}/api/v2/progress`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                },
            },
        ).then((resp) => resp.json());

        const progressData = response.data;

        returnData.quests = progressData.tasksProgress.reduce((completedTasks, current) => {
            if (current.complete) {
                completedTasks.push(current.id);
            }
            return completedTasks;
        }, []);
        returnData.questsFailed = progressData.tasksProgress.reduce((failedTasks, current) => {
            if (current.invalid) {
                failedTasks.push(current.id);
            }
            return failedTasks;
        }, []);
        returnData.objectivesCompleted = progressData.taskObjectivesProgress.reduce((completedObjectives, current) => {
            if (current.complete) {
                completedObjectives.push(current.id);
            }
            return completedObjectives;
        }, []);
        returnData.hasFlea = progressData.playerLevel >= 15 ? true : false;

        returnData.playerLevel = progressData.playerLevel;

        returnData.pmcFaction = progressData.pmcFaction;

        const hideoutData = getState().hideout.data;

        for (const station of hideoutData) {
            returnData.hideout[station.normalizedName] = 0;
        }

        for (const module of progressData.hideoutModulesProgress) {
            if (!module.complete) {
                continue;
            }

            for (const station of hideoutData) {
                for (const stationLevel of station.levels) {
                    if (stationLevel.id !== module.id) {
                        continue;
                    }
                    if (returnData.hideout[station.normalizedName] < stationLevel.level) {
                        returnData.hideout[station.normalizedName] = stationLevel.level;
                        continue;
                    }
                }
            }
        }

        return returnData;
    },
);

export const localStorageReadJson = (key, defaultValue) => {
    try {
        const value = localStorage.getItem(key);

        if (typeof value === 'string') {
            return JSON.parse(value);
        }
    } catch (error) {
        /* noop */
    }

    return defaultValue;
};
export const localStorageWriteJson = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        /* noop */
    }
};
export const localStorageReadJsonGameMode = (key, defaultValue) => {
    try {
        const gameMode = JSON.parse(localStorage.getItem('gameMode') ?? '"regular"');
        const settingsString = localStorage.getItem(`${gameMode}Settings`);

        if (typeof settingsString === 'string') {
            const settings = JSON.parse(settingsString);
            if (typeof settings[key] !== 'undefined') {
                return settings[key];
            }
        }
    } catch (error) {
        /* noop */
    }

    return defaultValue;
};
export const localStorageWriteJsonGameMode = (key, value) => {
    try {
        const gameMode = JSON.parse(localStorage.getItem('gameMode') ?? '"regular"');
        const gameModeSettings = JSON.parse(localStorage.getItem(`${gameMode}Settings`));
        gameModeSettings[key] = value;
        localStorage.setItem(`${gameMode}Settings`, JSON.stringify(gameModeSettings));
    } catch (error) {
        /* noop */
    }
};

const defaultSettings = {
    hasFlea: localStorageReadJson('useFlea', true),
    playerLevel: 72,
    pmcFaction: localStorageReadJson('pmcFaction', 'NONE'),
    useTarkovTracker: localStorageReadJson('useTarkovTracker', false),
    tarkovTrackerAPIKey: localStorageReadJson('tarkovTrackerAPIKey', ''),
    completedQuests: [],
    failedQuests: [],
    tarkovTrackerModules: [],
    prapor: localStorageReadJson('prapor', 4),
    therapist: localStorageReadJson('therapist', 4),
    fence: localStorageReadJson('fence', 0),
    skier: localStorageReadJson('skier', 4),
    peacekeeper: localStorageReadJson('peacekeeper', 4),
    mechanic: localStorageReadJson('mechanic', 4),
    ragman: localStorageReadJson('ragman', 4),
    jaeger: localStorageReadJson('jaeger', 4),
    ref: localStorageReadJson('ref', 4),
    'bitcoin-farm': localStorageReadJson('bitcoin-farm', 3),
    'booze-generator': localStorageReadJson('booze-generator', 1),
    'christmas-tree': localStorageReadJson('christmas-tree', 1),
    'intelligence-center': localStorageReadJson('intelligence-center', 3),
    'lavatory': localStorageReadJson('lavatory', 3),
    'medstation': localStorageReadJson('medstation', 3),
    'nutrition-unit': localStorageReadJson('nutrition-unit', 3),
    'water-collector': localStorageReadJson('water-collector', 3),
    'workbench': localStorageReadJson('workbench', 3),
    'solar-power': localStorageReadJson('solar-power', 0),
    'crafting': localStorageReadJson('crafting', 0),
    'hideout-management': localStorageReadJson('hideout-management', 0),
    'metabolism': localStorageReadJson('metabolism', 0),
    minDogtagLevel: localStorageReadJson('minDogtagLevel', 1),
    hideDogtagBarters: localStorageReadJson('hideDogtagBarters', false),
};

const settingsSlice = createSlice({
    name: 'settings',
    initialState: {
        progressStatus: 'idle',
        regular: localStorageReadJson('regularSettings', {...defaultSettings}),
        pve: localStorageReadJson('pveSettings', {
            ...defaultSettings,
            tarkovTrackerAPIKey: '',
            useTarkovTracker: false,
        }),
        hideRemoteControl: localStorageReadJson('hide-remote-control', false),
        playerPosition: localStorageReadJson('playerPosition', null),
        gameMode: localStorageReadJson('gameMode', 'regular'),
        Ti: localStorageReadJson('Ti', 0.03),
        Tr: localStorageReadJson('Tr', 0.03),
        tarkovTrackerDomain: localStorageReadJson('tarkovTrackerDomain', 'tarkovtracker.io'),
        loadingData: '',
    },
    reducers: {
        setTarkovTrackerAPIKey: (state, action) => {
            state[state.gameMode].tarkovTrackerAPIKey = action.payload;
            localStorageWriteJson(
                `${state.gameMode}Settings`,
                state[state.gameMode],
            );
        },
        toggleFlea: (state, action) => {
            state[state.gameMode].hasFlea = action.payload;
            localStorageWriteJson(`${state.gameMode}Settings`, state[state.gameMode]);
        },
        setMinDogtagLevel: (state, action) => {
            state[state.gameMode].minDogtagLevel = parseInt(action.payload);
            localStorageWriteJson(`${state.gameMode}Settings`, state[state.gameMode]);
        },
        toggleHideDogtagBarters: (state, action) => {
            state[state.gameMode].hideDogtagBarters = action.payload;
            localStorageWriteJson(`${state.gameMode}Settings`, state[state.gameMode]);
        },
        setStationOrTraderLevel: (state, action) => {
            state[state.gameMode][action.payload.target] = action.payload.value;
            localStorageWriteJson(`${state.gameMode}Settings`, state[state.gameMode]);
        },
        toggleTarkovTracker: (state, action) => {
            state[state.gameMode].useTarkovTracker = action.payload;
            localStorageWriteJson(`${state.gameMode}Settings`, state[state.gameMode]);
        },
        toggleHideRemoteControl: (state, action) => {
            state.hideRemoteControl = !state.hideRemoteControl;
            localStorageWriteJson(
                'hide-remote-control',
                state.hideRemoteControl,
            );
        },
        setPlayerPosition: (state, action) => {
            const posObj = action.payload?.position;
            const newPosition = posObj && typeof action.payload.rotation === 'number'
                ? {
                    position: {
                        x: posObj.x,
                        y: posObj.y,
                        z: posObj.z,
                    },
                    rotation: action.payload.rotation
                }
                : null;
            
            state.playerPosition = newPosition;
            console.log("writing new position"+JSON.stringify(newPosition))
            localStorageWriteJson('playerPosition', newPosition);
        },
        setGameMode: (state, action) => {
            state.gameMode = action.payload;
            localStorageWriteJson(
                'gameMode',
                action.payload,
            );
        },
        getGameModeSettings: (state, action) => {
            return {
                ...state,
                ...state[state.gameMode],
            };
        },
        setFleaMarketFactors: (state, action) => {
            state.Ti = action.payload.Ti;
            state.Tr = action.payload.Tr;
            localStorageWriteJson('Ti', action.payload.Ti);
            localStorageWriteJson('Tr', action.payload.Tr);
        },
        getTarkovTrackerDomain: (state, action) => {
            return state.tarkovTrackerDomain || 'tarkovtracker.io';
        },
        setTarkovTrackerDomain: (state, action) => {
            if (state.tarkovTrackerDomain === action.payload) {
                return;
            }
            state.tarkovTrackerDomain = action.payload;
            localStorageWriteJson(
                'tarkovTrackerDomain',
                action.payload,
            );
            state.regular.tarkovTrackerAPIKey = '';
            localStorageWriteJson('regularSettings', state[state.regular]);
            state.pve.tarkovTrackerAPIKey = '';
            localStorageWriteJson('pveSettings', state[state.pve]);
        },
        setDataLoading: (state, action) => {
            const loading = state.loadingData.split(',').filter(Boolean);
            if (loading.includes(action.payload)) {
                return;
            }
            loading.push(action.payload);
            state.loadingData = loading.join(',');
        },
        setDataLoaded: (state, action) => {
            const loading = state.loadingData.split(',');
            if (!loading.includes(action.payload)) {
                return;
            }
            state.loadingData = loading.filter(l => l !== action.payload).join(',');
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchTarkovTrackerProgress.pending, (state, action) => {
            state.status = 'loading';
        });
        builder.addCase(fetchTarkovTrackerProgress.fulfilled, (state, action) => {
            state.progressStatus = 'succeeded';

            if (action.payload) {
                state[state.gameMode].completedQuests = action.payload.quests;
                state[state.gameMode].failedQuests = action.payload.questsFailed;
                state[state.gameMode].objectivesCompleted = action.payload.objectivesCompleted;
                state[state.gameMode].hasFlea = action.payload.hasFlea;
                state[state.gameMode].playerLevel = action.payload.playerLevel;
                state[state.gameMode].pmcFaction = action.payload.pmcFaction;

                for (const stationKey in action.payload.hideout) {
                    settingsSlice.caseReducers.setStationOrTraderLevel(state, {
                        payload: {
                            target: stationKey,
                            value: action.payload.hideout[stationKey],
                        },
                    });
                }
            }
        });
        builder.addCase(fetchTarkovTrackerProgress.rejected, (state, action) => {
            state.progressStatus = 'failed';
            state.error = action.payload;
        });
    },
});

const selectSettings = state => state.settings;

export const selectAllTraders = createSelector([selectSettings], (settings) => {
    return {
        prapor: settings[settings.gameMode].prapor,
        therapist: settings[settings.gameMode].therapist,
        fence: settings[settings.gameMode].fence,
        skier: settings[settings.gameMode].skier,
        peacekeeper: settings[settings.gameMode].peacekeeper,
        mechanic: settings[settings.gameMode].mechanic,
        ragman: settings[settings.gameMode].ragman,
        jaeger: settings[settings.gameMode].jaeger,
        ref: settings[settings.gameMode].ref,
    };
});

export const selectAllStations = createSelector([selectSettings], (settings) => {
    return {
        'bitcoin-farm': settings[settings.gameMode]['bitcoin-farm'],
        'booze-generator': settings[settings.gameMode]['booze-generator'],
        'christmas-tree': settings[settings.gameMode]['christmas-tree'],
        'intelligence-center': settings[settings.gameMode]['intelligence-center'],
        lavatory: settings[settings.gameMode].lavatory,
        medstation: settings[settings.gameMode].medstation,
        'nutrition-unit': settings[settings.gameMode]['nutrition-unit'],
        'water-collector': settings[settings.gameMode]['water-collector'],
        workbench: settings[settings.gameMode].workbench,
        'solar-power': settings[settings.gameMode]['solar-power'],
    };
});

export const selectAllSkills = createSelector([selectSettings], (settings) => {
    return {
        crafting: settings[settings.gameMode].crafting,
        'hideout-management': settings[settings.gameMode]['hideout-management'],
        metabolism: settings[settings.gameMode].metabolism,
    };
});

export const selectCompletedQuests = createSelector([selectSettings], (settings) => {
    return settings[settings.gameMode].completedQuests;
});

export const {
    setTarkovTrackerAPIKey,
    toggleFlea,
    setMinDogtagLevel,
    setStationOrTraderLevel,
    toggleTarkovTracker,
    toggleHideRemoteControl,
    toggleHideDogtagBarters,
    setPlayerPosition,
    setGameMode,
    setFleaMarketFactors,
    setTarkovTrackerDomain,
    getTarkovTrackerDomain,
    setDataLoading,
    setDataLoaded,
} = settingsSlice.actions;

export default settingsSlice.reducer;
