import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import equal from 'fast-deep-equal';

import doFetchBosses from './do-fetch-bosses';
import { langCode } from '../../modules/lang-helpers';
import { placeholderBosses } from '../../modules/placeholder-data';
import rawBossData from '../../data/boss.json';
import useMapsData from '../maps';

const initialState = {
    data: placeholderBosses(langCode()),
    status: 'idle',
    error: null,
};

export const fetchBosses = createAsyncThunk('bosses/fetchBosses', () =>
    doFetchBosses(langCode()),
);
const bossesSlice = createSlice({
    name: 'bosses',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchBosses.pending, (state, action) => {
            state.status = 'loading';
        });
        builder.addCase(fetchBosses.fulfilled, (state, action) => {
            state.status = 'succeeded';

            if (!equal(state.data, action.payload)) {
                state.data = action.payload;
            }
        });
        builder.addCase(fetchBosses.rejected, (state, action) => {
            state.status = 'failed';
            console.log(action.error);
            state.error = action.payload;
        });
    },
});

export const bossesReducer = bossesSlice.reducer;

export const selectAllBosses = (state) => {
    const bosses = state.bosses.data.map(bossReadOnly => {
        const boss = {...bossReadOnly};
        boss.maps = [];
        boss.spawnChanceOverride = [];
        const bossJson = rawBossData.find(json => json.normalizedName === boss.normalizedName);
        if (bossJson) {
            boss.details = bossJson.details;
            boss.wikiLink = bossJson.wikiLink;
            boss.behavior = bossJson.behavior;
            if (bossJson.spawnChanceOverride) {
                boss.spawnChanceOverride = bossJson.spawnChanceOverride;
            }
        }
        return boss;
    });
    for (const map of state.maps.data) {
        // Loop through each boss for each map
        for (const bossSpawn of map.bosses) {
            const boss = bosses.find(boss => boss.normalizedName === bossSpawn.normalizedName);
            if (!boss) {
                continue;
            }
            let bossMap = boss.maps.find(savedMap => savedMap.id === map.id);
            if (!bossMap) {
                bossMap = {
                    name: map.name,
                    normalizedName: map.normalizedName,
                    id: map.id,
                    escorts: bossSpawn.escorts,
                    spawns: []
                }
                boss.maps.push(bossMap);
            }
            bossMap.spawns.push({
                spawnChance: bossSpawn.spawnChance,
                locations: bossSpawn.spawnLocations
            });
        }
    }
    return bosses;
};

let fetchedData = false;
let refreshInterval = false;

export default function useBossesData() {
    const dispatch = useDispatch();
    const { status, error } = useSelector((state) => state.bosses);
    const data = useSelector(selectAllBosses);
    useMapsData();

    useEffect(() => {
        if (!fetchedData) {
            fetchedData = true;
            dispatch(fetchBosses());
        }
        if (!refreshInterval) {
            refreshInterval = setInterval(() => {
                dispatch(fetchBosses());
            }, 600000);
        }
        return () => clearInterval(refreshInterval);
    }, [dispatch]);
    
    return { data, status, error };
};
