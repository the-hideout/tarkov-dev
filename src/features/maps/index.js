import { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import equal from 'fast-deep-equal';
import {
    mdiCity,
    mdiWarehouse,
    mdiFactory,
    mdiStore24Hour,
    mdiNeedle,
    mdiLighthouse,
    mdiTank,
    mdiBeach,
    mdiPineTree,
    mdiEarthBox,
} from '@mdi/js';

import doFetchMaps from './do-fetch-maps';
import { langCode } from '../../modules/lang-helpers';
import { placeholderMaps } from '../../modules/placeholder-data';
import i18n from '../../i18n';

import rawMapData from '../../data/maps.json';

const initialState = {
    data: placeholderMaps(langCode()),
    status: 'idle',
    error: null,
};

export const fetchMaps = createAsyncThunk('maps/fetchMaps', () =>
    doFetchMaps(langCode()),
);
const mapsSlice = createSlice({
    name: 'maps',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchMaps.pending, (state, action) => {
            state.status = 'loading';
        });
        builder.addCase(fetchMaps.fulfilled, (state, action) => {
            state.status = 'succeeded';

            if (!equal(state.data, action.payload)) {
                state.data = action.payload;
            }
        });
        builder.addCase(fetchMaps.rejected, (state, action) => {
            state.status = 'failed';
            console.log(action.error);
            state.error = action.payload;
        });
    },
});

export const mapsReducer = mapsSlice.reducer;

export const selectMaps = (state) => state.maps.data;

let fetchedData = false;
let refreshInterval = false;

export default function useMapsData() {
    const dispatch = useDispatch();
    const { data, status, error } = useSelector((state) => state.maps);

    useEffect(() => {
        if (!fetchedData) {
            fetchedData = true;
            dispatch(fetchMaps());
        }
        if (!refreshInterval) {
            refreshInterval = setInterval(() => {
                dispatch(fetchMaps());
            }, 600000);
        }
        return () => {
            clearInterval(refreshInterval);
            refreshInterval = false;
        };
    }, [dispatch]);
    
    return { data, status, error };
};

export const useMapImages = () => {
    const { data: maps } = useMapsData();
    let allMaps = useMemo(() => {
        const mapImages = {};
        for (const mapsGroup of rawMapData) {
            const apiMap = maps.find(map => map.normalizedName === mapsGroup.normalizedName);
            for (const map of mapsGroup.maps) {
                mapImages[map.key] = {
                    ...map,
                    name: apiMap?.name || i18n.t(`${mapsGroup.normalizedName}-name`, { ns: 'maps' }),
                    normalizedName: mapsGroup.normalizedName,
                    primaryPath: mapsGroup.primaryPath,
                    displayText: apiMap?.name || i18n.t(`${mapsGroup.normalizedName}-name`, { ns: 'maps' }),
                    description: apiMap?.description || i18n.t(`${mapsGroup.normalizedName}-description`, { ns: 'maps' }),
                    duration: apiMap?.raidDuration ? apiMap?.raidDuration + ' min' : undefined,
                    players: apiMap?.players || mapsGroup.players,
                    image: `/maps/${map.key}.jpg`,
                    imageThumb: `/maps/${map.key}_thumb.jpg`,
                    bosses: apiMap?.bosses.map(bossSpawn => {
                        return {
                            name: bossSpawn.name,
                            normalizedName: bossSpawn.normalizedName,
                            spawnLocations: bossSpawn.spawnLocations,
                        }
                    }),
                    spawns: apiMap?.spawns || [],
                };
                if (map.projection && map.projection !== '3D') {
                    mapImages[map.key].displayText += ` - ${i18n.t(map.projection, { ns: 'maps' })}`;
                }
                if (map.orientation) {
                    mapImages[map.key].displayText += ` - ${i18n.t(map.orientation, { ns: 'maps' })}`;
                }
                if (map.specific) {
                    mapImages[map.key].displayText += ` - ${i18n.t(map.specific, { ns: 'maps' })}`;
                }
                if (map.extra) {
                    mapImages[map.key].displayText += ` - ${map.extra}`;
                }
            }
        }
        return mapImages;
    }, [maps]);
    return allMaps;
};

export const mapIcons = {
    'streets-of-tarkov': mdiCity,
    'customs': mdiWarehouse,
    'factory': mdiFactory,
    'interchange': mdiStore24Hour,
    'the-lab': mdiNeedle,
    'lighthouse': mdiLighthouse,
    'reserve': mdiTank,
    'shoreline': mdiBeach,
    'woods': mdiPineTree,
    'openworld': mdiEarthBox,
};
