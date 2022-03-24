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
        hasFlea: JSON.parse(localStorage.getItem('useFlea')) || true,
        tarkovTrackerAPIKey:
            JSON.parse(localStorage.getItem('tarkovTrackerAPIKey')) || '',
        prapor: JSON.parse(localStorage.getItem('prapor')) || 4,
        therapist: JSON.parse(localStorage.getItem('therapist')) || 4,
        fence: JSON.parse(localStorage.getItem('fence')) || 0,
        skier: JSON.parse(localStorage.getItem('skier')) || 4,
        peacekeeper: JSON.parse(localStorage.getItem('peacekeeper')) || 4,
        mechanic: JSON.parse(localStorage.getItem('mechanic')) || 4,
        ragman: JSON.parse(localStorage.getItem('ragman')) || 4,
        jaeger: Number.isInteger(JSON.parse(localStorage.getItem('jaeger')))
            ? JSON.parse(localStorage.getItem('jaeger'))
            : 4,
        'booze-generator': Number.isInteger(
            JSON.parse(localStorage.getItem('booze-generator')),
        )
            ? JSON.parse(localStorage.getItem('booze-generator'))
            : 1,
        'christmas-tree': Number.isInteger(
            JSON.parse(localStorage.getItem('christmas-tree')),
        )
            ? JSON.parse(localStorage.getItem('christmas-tree'))
            : 1,
        'intelligence-center': Number.isInteger(
            JSON.parse(localStorage.getItem('intelligence-center')),
        )
            ? JSON.parse(localStorage.getItem('intelligence-center'))
            : 3,
        lavatory: Number.isInteger(JSON.parse(localStorage.getItem('lavatory')))
            ? JSON.parse(localStorage.getItem('lavatory'))
            : 3,
        medstation: Number.isInteger(
            JSON.parse(localStorage.getItem('medstation')),
        )
            ? JSON.parse(localStorage.getItem('medstation'))
            : 3,
        'nutrition-unit': Number.isInteger(
            JSON.parse(localStorage.getItem('nutrition-unit')),
        )
            ? JSON.parse(localStorage.getItem('nutrition-unit'))
            : 3,
        'water-collector': Number.isInteger(
            JSON.parse(localStorage.getItem('water-collector')),
        )
            ? JSON.parse(localStorage.getItem('water-collector'))
            : 3,
        workbench: Number.isInteger(
            JSON.parse(localStorage.getItem('workbench')),
        )
            ? JSON.parse(localStorage.getItem('workbench'))
            : 3,
        'solar-power': localStorageReadJson('solar-power', 0),
        crafting: JSON.parse(localStorage.getItem('crafting')) || 0,
        'hideout-managment':
            JSON.parse(localStorage.getItem('hideout-managment')) || 0,
        completedQuests: [],
        useTarkovTracker:
            JSON.parse(localStorage.getItem('useTarkovTracker')) || false,
        tarkovTrackerModules: [],
        hideRemoteControl: localStorageReadJson('hide-remote-control', false),
    },
    reducers: {
        setTarkovTrackerAPIKey: (state, action) => {
            state.tarkovTrackerAPIKey = action.payload;
            localStorage.setItem(
                'tarkovTrackerAPIKey',
                JSON.stringify(action.payload),
            );
        },
        toggleFlea: (state, action) => {
            state.hasFlea = action.payload;
            localStorage.setItem('useFlea', JSON.stringify(action.payload));
        },
        setStationOrTraderLevel: (state, action) => {
            state[action.payload.target] = action.payload.value;
            localStorage.setItem(
                action.payload.target,
                JSON.stringify(action.payload.value),
            );
        },
        toggleTarkovTracker: (state, action) => {
            state.useTarkovTracker = action.payload;
            localStorage.setItem(
                'useTarkovTracker',
                JSON.stringify(action.payload),
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
        'hideout-managment': state.settings['hideout-managment'],
    };
};

export const selectCompletedQuests = (state) => {
    return state.settings.completedQuests;
};

export const {
    setTarkovTrackerAPIKey,
    toggleFlea,
    setStationOrTraderLevel,
    toggleTarkovTracker,
    toggleHideRemoteControl,
} = settingsSlice.actions;

export default settingsSlice.reducer;
