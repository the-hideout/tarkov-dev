import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchTarkovTrackerProgress = createAsyncThunk(
    'settings/fetchTarkovTrackerProgress',
    async (apiKey) => {
        if (!apiKey) {
            return false;
        }

        const returnData = {
            flea: false,
            hideout: {
                'bitcoin-farm': 0,
                'booze-generator': 0,
                'christmas-tree': 0,
                'intelligence-center': 0,
                lavatory: 0,
                medstation: 0,
                'nutrition-unit': 0,
                'water-collector': 0,
                workbench: 0,
                'solar-power': 0,
            },
            quests: {},
        };

        const response = await fetch(
            'https://tarkovtracker.io/api/v1/progress',
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                },
            },
        );

        const progressData = await response.json();

        returnData.quests = progressData.quests;
        returnData.flea = progressData.level >= 15 ? true : false;

        const bodyQuery = JSON.stringify({
            query: `{
        hideoutModules {
            id
            name
            level
        }
    }`,
        });

        const apiResponse = await fetch('https://api.tarkov.dev/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: bodyQuery,
        });

        const hideoutData = await apiResponse.json();
        const builtModules = [];

        for (const moduleId in progressData.hideout) {
            if (!progressData.hideout[moduleId].complete) {
                continue;
            }

            builtModules.push(
                hideoutData.data.hideoutModules.find(
                    (currentModule) =>
                        currentModule.id.toString() === moduleId.toString(),
                ),
            );
        }

        for (const module of builtModules) {
            if (!module?.name) {
                continue;
            }

            const moduleKey = module.name.toLowerCase().replace(/\s/g, '-');

            if (!returnData.hideout[moduleKey]) {
                returnData.hideout[moduleKey] = module.level;

                continue;
            }

            if (returnData.hideout[moduleKey] > module.level) {
                continue;
            }

            returnData.hideout[moduleKey] = module.level;
        }

        return returnData;
    },
);

const localStorageReadJson = (key, defaultValue) => {
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
const localStorageWriteJson = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        /* noop */
    }
};

const settingsSlice = createSlice({
    name: 'settings',
    initialState: {
        progressStatus: 'idle',
        hasFlea: localStorageReadJson('useFlea', true),
        tarkovTrackerAPIKey: localStorageReadJson('tarkovTrackerAPIKey', ''),
        prapor: localStorageReadJson('prapor', 4),
        therapist: localStorageReadJson('therapist', 4),
        fence: localStorageReadJson('fence', 0),
        skier: localStorageReadJson('skier', 4),
        peacekeeper: localStorageReadJson('peacekeeper', 4),
        mechanic: localStorageReadJson('mechanic', 4),
        ragman: localStorageReadJson('ragman', 4),
        jaeger: localStorageReadJson('jaeger', 4),
        'bitcoin-farm': localStorageReadJson('bitcoin-farm', 3),
        'booze-generator': localStorageReadJson('booze-generator', 1),
        'christmas-tree': localStorageReadJson('christmas-tree', 1),
        'intelligence-center': localStorageReadJson('intelligence-center', 3),
        lavatory: localStorageReadJson('lavatory', 3),
        medstation: localStorageReadJson('medstation', 3),
        'nutrition-unit': localStorageReadJson('nutrition-unit', 3),
        'water-collector': localStorageReadJson('water-collector', 3),
        workbench: localStorageReadJson('workbench', 3),
        'solar-power': localStorageReadJson('solar-power', 0),
        crafting: localStorageReadJson('crafting', 0),
        'hideout-management': localStorageReadJson('hideout-management', 0),
        completedQuests: [],
        useTarkovTracker: localStorageReadJson('useTarkovTracker', false),
        tarkovTrackerModules: [],
        hideRemoteControl: localStorageReadJson('hide-remote-control', false),
        minDogtagLevel: localStorageReadJson('minDogtagLevel', 1),
    },
    reducers: {
        setTarkovTrackerAPIKey: (state, action) => {
            state.tarkovTrackerAPIKey = action.payload;
            localStorageWriteJson(
                'tarkovTrackerAPIKey',
                action.payload,
            );
        },
        toggleFlea: (state, action) => {
            state.hasFlea = action.payload;
            localStorageWriteJson('useFlea', action.payload);
        },
        setMinDogtagLevel: (state, action) => {
            state.minDogtagLevel = parseInt(action.payload);
            localStorageWriteJson('minDogtagLevel', parseInt(action.payload));
        },
        setStationOrTraderLevel: (state, action) => {
            state[action.payload.target] = action.payload.value;
            localStorageWriteJson(
                action.payload.target,
                action.payload.value,
            );
        },
        toggleTarkovTracker: (state, action) => {
            /*if (!state.useTarkovTracker && action.payload) {
                fetchTarkovTrackerProgress(state.tarkovTrackerAPIKey);
            }*/
            state.useTarkovTracker = action.payload;
            localStorageWriteJson(
                'useTarkovTracker',
                action.payload,
            );
        },
        toggleHideRemoteControl: (state, action) => {
            state.hideRemoteControl = !state.hideRemoteControl;
            localStorageWriteJson(
                'hide-remote-control',
                state.hideRemoteControl,
            );
        },
    },
    extraReducers: {
        [fetchTarkovTrackerProgress.pending]: (state, action) => {
            state.progressStatus = 'loading';
        },
        [fetchTarkovTrackerProgress.fulfilled]: (state, action) => {
            state.progressStatus = 'succeeded';

            if (action.payload) {
                state.completedQuests = state.completedQuests.concat(
                    Object.keys(action.payload.quests),
                );
                state.hasFlea = action.payload.flea;

                for (const stationKey in action.payload.hideout) {
                    settingsSlice.caseReducers.setStationOrTraderLevel(state, {
                        payload: {
                            target: stationKey,
                            value: action.payload.hideout[stationKey],
                        },
                    });
                }
            }
        },
        [fetchTarkovTrackerProgress.rejected]: (state, action) => {
            state.progressStatus = 'failed';
            state.error = action.payload;
        },
    },
});

export const selectAllTraders = (state) => {
    return {
        prapor: state.settings.prapor,
        therapist: state.settings.therapist,
        fence: state.settings.fence,
        skier: state.settings.skier,
        peacekeeper: state.settings.peacekeeper,
        mechanic: state.settings.mechanic,
        ragman: state.settings.ragman,
        jaeger: state.settings.jaeger,
    };
};

export const selectAllStations = (state) => {
    return {
        'bitcoin-farm': state.settings['bitcoin-farm'],
        'booze-generator': state.settings['booze-generator'],
        // 'christmas-tree': state.settings['christmas-tree'],
        'intelligence-center': state.settings['intelligence-center'],
        lavatory: state.settings.lavatory,
        medstation: state.settings.medstation,
        'nutrition-unit': state.settings['nutrition-unit'],
        'water-collector': state.settings['water-collector'],
        workbench: state.settings.workbench,
        'solar-power': state.settings['solar-power'],
    };
};

export const selectAllSkills = (state) => {
    return {
        crafting: state.settings.crafting,
        'hideout-management': state.settings['hideout-management'],
    };
};

export const selectCompletedQuests = (state) => {
    return state.settings.completedQuests;
};

export const {
    setTarkovTrackerAPIKey,
    toggleFlea,
    setMinDogtagLevel,
    setStationOrTraderLevel,
    toggleTarkovTracker,
    toggleHideRemoteControl,
} = settingsSlice.actions;

export default settingsSlice.reducer;
