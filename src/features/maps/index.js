import { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import equal from 'fast-deep-equal';
import {
    mdiImageFilterCenterFocusStrong,
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

import doFetchMaps from './do-fetch-maps.mjs';
import { langCode } from '../../modules/lang-helpers.js';
import { placeholderMaps } from '../../modules/placeholder-data.js';
import i18n from '../../i18n.js';

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
        const apiImageDataMerge = (mapGroup, imageData, apiData) => {
            mapImages[imageData.key] = {
                id: apiData?.id,
                ...imageData,
                name: apiData?.name || i18n.t(`${mapGroup.normalizedName}-name`, { ns: 'maps' }),
                normalizedName: mapGroup.normalizedName,
                primaryPath: mapGroup.primaryPath,
                displayText: apiData?.name || i18n.t(`${mapGroup.normalizedName}-name`, { ns: 'maps' }),
                description: apiData?.description || i18n.t(`${mapGroup.normalizedName}-description`, { ns: 'maps' }),
                duration: apiData?.raidDuration ? apiData?.raidDuration + ' min' : undefined,
                players: apiData?.players || mapGroup.players,
                image: `/maps/${imageData.key}.jpg`,
                imageThumb: `/maps/${imageData.key}_thumb.jpg`,
                bosses: apiData?.bosses.map(bossSpawn => {
                    return {
                        name: bossSpawn.name,
                        normalizedName: bossSpawn.normalizedName,
                        spawnChance: bossSpawn.spawnChance,
                        spawnLocations: bossSpawn.spawnLocations,
                    }
                }),
                spawns: apiData?.spawns || [],
                extracts: apiData?.extracts || [],
                locks: apiData?.locks || [],
                hazards: apiData?.hazards || [],
                lootContainers: apiData?.lootContainers || [],
                switches: apiData?.switches || [],
                stationaryWeapons: apiData?.stationaryWeapons || [],
            };
            if (imageData.projection) {
                mapImages[imageData.key].displayText += ` - ${i18n.t(imageData.projection, { ns: 'maps' })}`;
            }
            if (imageData.orientation) {
                mapImages[imageData.key].displayText += ` - ${i18n.t(imageData.orientation, { ns: 'maps' })}`;
            }
            if (imageData.specific) {
                mapImages[imageData.key].displayText += ` - ${i18n.t(imageData.specific, { ns: 'maps' })}`;
            }
            if (imageData.extra) {
                mapImages[imageData.key].displayText += ` - ${imageData.extra}`;
            }
            if (imageData.altMaps) {
                for (const altKey of imageData.altMaps) {
                    const altApiMap = maps.find(map => map.normalizedName === altKey);
                    apiImageDataMerge(mapGroup, {
                        ...imageData,
                        key: altKey,
                        altMaps: undefined,
                        suppress: true,
                    }, altApiMap);
                }
            }
        };
        for (const mapsGroup of rawMapData) {
            const apiMap = maps.find(map => map.normalizedName === mapsGroup.normalizedName);
            for (const map of mapsGroup.maps) {
                apiImageDataMerge(mapsGroup, map, apiMap);
            }
        }
        return mapImages;
    }, [maps]);
    return allMaps;
};

export const useMapImagesSortedArray = () => {
    let mapArray = Object.values(useMapImages())
    
    mapArray.sort((a, b) => {
        if (a.normalizedName === 'openworld')
            return 1;
        if (b.normalizedName === 'openworld')
            return -1;
        return a.name.localeCompare(b.name);
    });

    return mapArray
}

export const mapIcons = {
    'ground-zero': mdiImageFilterCenterFocusStrong,
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
