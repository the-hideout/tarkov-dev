import {
    createSlice,
} from '@reduxjs/toolkit';

const settingsSlice = createSlice({
    name: 'settings',
    initialState: {
        progressStatus: 'idle',
        hasFlea: JSON.parse(localStorage.getItem('useFlea')) || true,
        tarkovTrackerAPIKey: JSON.parse(localStorage.getItem('tarkovTrackerAPIKey')) || false,
        prapor: JSON.parse(localStorage.getItem('prapor')) || 4,
        therapist: JSON.parse(localStorage.getItem('therapist')) || 4,
        fence: JSON.parse(localStorage.getItem('fence')) || 4,
        skier: JSON.parse(localStorage.getItem('skier')) || 4,
        peacekeeper: JSON.parse(localStorage.getItem('peacekeeper')) || 4,
        mechanic: JSON.parse(localStorage.getItem('mechanic')) || 4,
        ragman: JSON.parse(localStorage.getItem('ragman')) || 4,
        jaeger: JSON.parse(localStorage.getItem('jaeger')) || 4,
        'booze-generator': JSON.parse(localStorage.getItem('booze-generator')) || 1,
        'intelligence-center': JSON.parse(localStorage.getItem('intelligence-center')) || 3,
        lavatory: JSON.parse(localStorage.getItem('lavatory')) || 3,
        medstation: JSON.parse(localStorage.getItem('medstation')) || 3,
        'nutrition-unit': JSON.parse(localStorage.getItem('nutrition-unit')) || 3,
        'water-collector': JSON.parse(localStorage.getItem('water-collector')) || 3,
        workbench: JSON.parse(localStorage.getItem('workbench')) || 3,
        crafting: JSON.parse(localStorage.getItem('crafting')) || 0,
        'hideout-managment': JSON.parse(localStorage.getItem('hideout-managment')) || 0,
        completedQuests: [],
    },
    reducers: {
        toggleFlea: (state, action) => {
            state.hasFlea = action.payload;
            localStorage.setItem('useFlea', JSON.stringify(action.payload));
        },
        setStationOrTraderLevel: (state, action) => {
            state[action.payload.target] = action.payload.value;
            localStorage.setItem(action.payload.target, JSON.stringify(action.payload.value));
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
        'intelligence-center': state.settings['intelligence-center'],
        lavatory: state.settings.lavatory,
        medstation: state.settings.medstation,
        'nutrition-unit': state.settings['nutrition-unit'],
        'water-collector': state.settings['water-collector'],
        workbench: state.settings.workbench,
    };
};

export const selectAllSkills = (state) => {
    return {
        crafting: state.settings.crafting,
        'hideout-managment': state.settings['hideout-managment']
    }
}

export const selectCompletedQuests = (state) => {
    return state.settings.completedQuests;
};

export const {
    toggleFlea,
    setStationOrTraderLevel,
} = settingsSlice.actions;

export default settingsSlice.reducer;
