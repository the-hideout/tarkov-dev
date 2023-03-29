import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchTarkovTrackerProgress = createAsyncThunk(
    'settings/fetchTarkovTrackerProgress',
    async (apiKey) => {
        if (!apiKey || typeof apiKey !== 'string' || !apiKey.match(/^[a-zA-Z0-9]{22}$/)) {
            return false;
        }

        const returnData = {
            flea: true,
            hideout: {},
            quests: [],
        };

        const response = await fetch('https://tarkovtracker.io/api/v2/progress', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
        }).then((resp) => resp.json());

        const progressData = response.data;

        returnData.quests = progressData.tasksProgress.reduce((completedTasks, current) => {
            if (current.complete) {
                completedTasks.push(current.id);
            }
            return completedTasks;
        }, []);
        returnData.flea = progressData.playerLevel >= 15 ? true : false;

        const bodyQuery = JSON.stringify({
            query: `{
        hideoutStations {
            id
            name
            normalizedName
            levels {
                id
                level
            }
        }
    }`,
        });

        const hideoutData = await fetch('https://api.tarkov.dev/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: bodyQuery,
        })
            .then((resp) => resp.json())
            .then((resp) => resp.data.hideoutStations);

        for (const station of hideoutData) {
            returnData.hideout[station.normalizedName] = 0;
        }

        for (const module of progressData.hideoutModulesProgress) {
            if (!module.complete) {
                continue;
            }

            for (const station of hideoutData) {
                for (const level of station.levels) {
                    if (level.id !== module.id) {
                        continue;
                    }
                    if (returnData.hideout[station.normalizedName] < level.level) {
                        returnData.hideout[station.normalizedName] = level.level;
                        continue;
                    }
                }
            }
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
        hideDogtagBarters: localStorageReadJson('hideTogtagBarters', false),
    },
    reducers: {
        setTarkovTrackerAPIKey: (state, action) => {
            state.tarkovTrackerAPIKey = action.payload;
            localStorageWriteJson('tarkovTrackerAPIKey', action.payload);
        },
        toggleFlea: (state, action) => {
            state.hasFlea = action.payload;
            localStorageWriteJson('useFlea', action.payload);
        },
        setMinDogtagLevel: (state, action) => {
            state.minDogtagLevel = parseInt(action.payload);
            localStorageWriteJson('minDogtagLevel', parseInt(action.payload));
        },
        toggleHideDogtagBarters: (state, action) => {
            state.hideDogtagBarters = action.payload;
            localStorageWriteJson('hideDogtagBarters', action.payload);
        },
        setStationOrTraderLevel: (state, action) => {
            state[action.payload.target] = action.payload.value;
            localStorageWriteJson(action.payload.target, action.payload.value);
        },
        toggleTarkovTracker: (state, action) => {
            state.useTarkovTracker = action.payload;
            localStorageWriteJson('useTarkovTracker', action.payload);
        },
        toggleHideRemoteControl: (state, action) => {
            state.hideRemoteControl = !state.hideRemoteControl;
            localStorageWriteJson('hide-remote-control', state.hideRemoteControl);
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchTarkovTrackerProgress.pending, (state, action) => {
            state.status = 'loading';
        });
        builder.addCase(fetchTarkovTrackerProgress.fulfilled, (state, action) => {
            state.progressStatus = 'succeeded';

            if (action.payload) {
                state.completedQuests = action.payload.quests;
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
        });
        builder.addCase(fetchTarkovTrackerProgress.rejected, (state, action) => {
            state.progressStatus = 'failed';
            state.error = action.payload;
        });
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
        'christmas-tree': state.settings['christmas-tree'],
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
    toggleHideDogtagBarters,
} = settingsSlice.actions;

export default settingsSlice.reducer;
