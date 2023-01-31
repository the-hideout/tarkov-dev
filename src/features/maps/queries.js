// Queries used to get flea market fee factors, armor attributes,
// and item categories from the API
import { useMemo } from 'react';
import { useQuery } from 'react-query';
import doFetchMaps from './do-fetch-maps';
import { langCode } from '../../modules/lang-helpers';
import { placeholderMaps } from '../../modules/placeholder-data';
import rawMapData from '../../data/maps.json';

export const useMapsQuery = (queryOptions) => {
    const mapsQuery = useQuery('maps', () => doFetchMaps(langCode()), {
        refetchInterval: 600000,
        placeholderData: placeholderMaps(langCode()),
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        ...queryOptions,
    });

    return mapsQuery;
};

export const useMapImages = () => {
    const mapsQuery = useMapsQuery();
    const maps = useMemo(() => {
        return mapsQuery.data;
    }, [mapsQuery]);

    let allMaps = useMemo(() => {
        const mapImages = {};
        for (const mapsGroup of rawMapData) {
            const apiMap = maps.find(map => map.normalizedName === mapsGroup.normalizedName);
            for (const map of mapsGroup.maps) {
                mapImages[map.key] = {
                    ...map,
                    name: apiMap?.name || mapsGroup.name,
                    normalizedName: mapsGroup.normalizedName,
                    primaryPath: mapsGroup.primaryPath,
                    displayText: apiMap?.name || mapsGroup.name,
                    description: apiMap?.description || mapsGroup.description,
                    duration: apiMap?.raidDuration ? apiMap?.raidDuration + ' min' : undefined,
                    players: apiMap?.players || mapsGroup.players,
                    image: `/maps/${map.key}.jpg`,
                };
                if (map.appendTitle) {
                    mapImages[map.key].displayText += ` - ${map.appendTitle}`;
                }
            }
        }
        return mapImages;
    }, [maps]);
    return allMaps;
};
