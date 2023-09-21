import { useEffect, useRef, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    TransformWrapper,
    TransformComponent,
} from 'react-zoom-pan-pinch';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'
import "@fortawesome/fontawesome-free/css/all.min.css"

import { setPlayerPosition } from '../features/settings/settingsSlice';

import 'leaflet.awesome-markers/dist/leaflet.awesome-markers';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.css'
import 'leaflet-fullscreen/dist/Leaflet.fullscreen';
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css';

import '../modules/leaflet-control-coordinates';
import '../modules/leaflet-control-groupedlayer';

import { useMapImages } from '../features/maps';
import useItemsData from '../features/items';
import useQuestsData from '../features/quests';

import testMapData from '../data/maps_test.json';

import Time from './Time';
import SEO from './SEO';

import ErrorPage from './error-page';

import './Maps.css';

const showTestMarkers = false;

function getCRS(mapData) {
    let scaleX = 1;
    let scaleY = 1;
    let marginX = 0;
    let marginY = 0;
    if (mapData) {    
        if (mapData.transform) {
            scaleX = mapData.transform[0];
            scaleY = mapData.transform[2] * -1;
            marginX = mapData.transform[1];
            marginY = mapData.transform[3];
        }
    }
    return L.extend({}, L.CRS.Simple, {
        transformation: new L.Transformation(scaleX, marginX, scaleY, marginY),
        projection: L.extend({}, L.Projection.LonLat, {
            project: latLng => {
                return L.Projection.LonLat.project(applyRotation(latLng, mapData.coordinateRotation));
            },
            unproject: point => {
                return applyRotation(L.Projection.LonLat.unproject(point), mapData.coordinateRotation * -1);
            },
        }),
    });
}

function applyRotation(latLng, rotation) {
    if (!latLng.lng && !latLng.lat) {
        return L.latLng(0, 0);
    }
    if (!rotation) {
        return latLng;
    }

    const angleInRadians = (rotation * Math.PI) / 180;
    const cosAngle = Math.cos(angleInRadians);
    const sinAngle = Math.sin(angleInRadians);

    const {lng: x, lat: y} = latLng;
    const rotatedX = x * cosAngle - y * sinAngle;
    const rotatedY = x * sinAngle + y * cosAngle;
    return L.latLng(rotatedY, rotatedX);
}

function pos(position) {
    return [position.z, position.x];
}

function getScaledBounds(bounds, scaleFactor) {
    // Calculate the center point of the bounds
    const centerX = (bounds[0][0] + bounds[1][0]) / 2;
    const centerY = (bounds[0][1] + bounds[1][1]) / 2;
    
    // Calculate the new width and height
    const width = bounds[1][0] - bounds[0][0];
    const height = bounds[1][1] - bounds[0][1];
    const newWidth = width * scaleFactor;
    const newHeight = height * scaleFactor;
    
    // Update the coordinates of the two points defining the bounds
    const newBounds = [
        [centerY - newHeight / 2, centerX - newWidth / 2],
        [centerY + newHeight / 2, centerX + newWidth / 2]
    ];

    // console.log("Initial Rectangle:", bounds);
    // console.log("Scaled Rectangle:", newBounds);
    // console.log("Center:", L.bounds(bounds).getCenter(true));
    
    return newBounds;
}

function getBounds(mapData) {
    if (!mapData.bounds) {
        return undefined;
    }
    return [[mapData.bounds[0][1], mapData.bounds[0][0]], [mapData.bounds[1][1], mapData.bounds[1][0]]];
}

function markerIsShown(heightLayer, position) {
    const elevation = position.y;
    const height = heightLayer.options?.heightRange;
    if (!height) {
        return true;
    }
    if (elevation > height[0] && elevation <= height[1]) {
        return true;
    }
    return false;
}

function positionToBounds(obj) {
    const position = obj.position;
    const size = obj.size;
    const halfX = size.x / 2;
    const halfZ = size.z / 2;
    return [[position.z - halfZ, position.x - halfX], [position.z + halfZ, position.x + halfX]];
}

function Map() {
    let { currentMap } = useParams();

    const { t } = useTranslation();
    const dispatch = useDispatch();

    useEffect(() => {
        let viewableHeight = window.innerHeight - document.querySelector('.navigation')?.offsetHeight || 0;
        if (viewableHeight < 100) {
            viewableHeight = window.innerHeight;
        }

        document.documentElement.style.setProperty(
            '--display-height',
            `${viewableHeight}px`,
        );

        return function cleanup() {
            document.documentElement.style.setProperty(
                '--display-height',
                `auto`,
            );
        };
    });

    const playerPosition = useSelector((state) => state.settings.playerPosition);

    const ref = useRef();
    const mapRef = useRef(null);

    const onMapContainerRefChange = useCallback(node => {
        if (node) {
            let viewableHeight = window.innerHeight - document.querySelector('.navigation')?.offsetHeight || 0;
            if (viewableHeight < 100) {
                viewableHeight = window.innerHeight;
            }
            node.style.height = `${viewableHeight}px`;
        }
    }, []);

    useEffect(() => {
        ref?.current?.resetTransform();
    }, [currentMap]);

    const { data: items } = useItemsData();
    const { data: quests} = useQuestsData();

    let allMaps = useMapImages();

    const mapData = useMemo(() => {
        return allMaps[currentMap];
    }, [allMaps, currentMap]);

    useEffect(() => {
        if (!mapData || mapData.projection !== 'interactive') {
            return;
        }
        if (mapRef.current?._leaflet_id) {
            mapRef.current.remove();
        }
        const map = L.map('leaflet-map', {
            maxBounds: getScaledBounds(mapData.bounds, 1.5),
            center: [0, 0],
            zoom: mapData.minZoom+1,
            minZoom: mapData.minZoom,
            maxZoom: mapData.maxZoom,
            scrollWheelZoom: true,
            crs: getCRS(mapData),
            attributionControl: false,
        });
        const layerControl = L.control.groupedLayers(null, null, {
            position: 'topleft',
            collapsed: true,
            groupCheckboxes: true,
            exclusiveGroups: [t('Levels')],
        }).addTo(map);
        map.addControl(new L.Control.Fullscreen({
            title: {
                'false': t('View Fullscreen'),
                'true': t('Exit Fullscreen'),
            }
        }));

        L.control.coordinates({
            decimals: 2,
            labelTemplateLat: 'z: {y}',
            labelTemplateLng: 'x: {x}',
            enableUserInput: false,
            wrapCoordinate: false,
            position: 'topleft',
            customLabelFcn: (latLng, opts) => {
                return `x: ${latLng.lng.toFixed(2)} z: ${latLng.lat.toFixed(2)}`;
            }
        }).addTo(map);

        //L.control.scale({position: 'bottomright'}).addTo(map);
        
        let baseLayer;
        const bounds = getBounds(mapData);
        if (mapData.svgPath) {
            // if (process.env.NODE_ENV === "development") {
            //     mapData.svgPath = mapData.svgPath.replace("assets.tarkov.dev/maps/svg", "raw.githubusercontent.com/the-hideout/tarkov-dev-src-maps/main/interactive");
            // }
            baseLayer = L.imageOverlay(mapData.svgPath, bounds, {
                heightRange: mapData.heightRange || [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
                type: 'layer-svg'
            });
        }
        else {
            baseLayer = L.tileLayer(mapData.mapPath || `https://assets.tarkov.dev/maps/${mapData.normalizedName}/{z}/{x}/{y}.png`, {
                tileSize: mapData.tileSize,
                bounds: bounds,
                heightRange: mapData.heightRange || [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
                type: 'layer-tile',
            });
        }
        let heightLayer = baseLayer;
        baseLayer.addTo(map);
        //layerControl.addBaseLayer(baseLayer, t('Base'));

        // Add map layers
        if (mapData.layers) {
            for (const layer of mapData.layers) {
                let tileLayer;
                
                if (layer.svgPath) {
                    // if (process.env.NODE_ENV === "development") {
                    //     layer.svgPath = layer.svgPath.replace("assets.tarkov.dev/maps/svg", "raw.githubusercontent.com/the-hideout/tarkov-dev-src-maps/main/interactive");
                    // }
                    tileLayer = L.imageOverlay(layer.svgPath, bounds, {
                        heightRange: layer.heightRange,
                        type: 'layer-svg',
                    });
                }
                else {
                    tileLayer = L.tileLayer(layer.path, {
                        tileSize: mapData.tileSize,
                        bounds: bounds,
                        heightRange: layer.heightRange,
                        type: 'layer-tile',
                    });
                }
                layerControl.addOverlay(tileLayer, t(layer.name), t('Levels'));
                if (layer.show) {
                    heightLayer = tileLayer;
                    tileLayer.addTo(map);
                }
                if (layer.heightRange) {
                    tileLayer.on('add', () => {
                        for (const marker of Object.values(map._layers)) {
                            if (!marker.options.icon?.options.position) {
                                continue;
                            }
                            const elevation = marker.options.icon.options.position.y;
                            const height = layer.heightRange;
                            if (elevation > height[0] && elevation <= height[1]) {
                                marker._icon.classList.remove('off-level');
                            } else {
                                marker._icon.classList.add('off-level');
                            }
                        }
                        if (baseLayer.options.type === 'layer-svg') {
                            baseLayer._image.classList.add('off-level');
                        }
                    });
                    tileLayer.on('remove', () => {
                        const heightLayer = Object.values(map._layers).findLast(l => l.options?.heightRange);
                        if (!heightLayer) {
                            return;
                        }
                        const height = heightLayer.options.heightRange;
                        for (const marker of Object.values(map._layers)) {
                            if (!marker.options.icon?.options.position) {
                                continue;
                            }
                            const elevation = marker.options.icon.options.position.y;
                            if (elevation > height[0] && elevation <= height[1]) {
                                marker._icon.classList.remove('off-level');
                            } else {
                                marker._icon.classList.add('off-level');
                            }
                        }
                        const layers = Object.values(map._layers).filter(l => l.options.type === 'layer-svg');
                        if (layers.length === 1 && baseLayer.options.type === 'layer-svg') {
                            baseLayer._image.classList.remove('off-level');
                        }
                    });
                }
            }
        }

        const categories = {
            quest_item: t('Quest Item'),
            quest_zone: t('Quest Zone'),
            supply_crate: t('Technical Supply Crate'),
            spawn_pmc: t('PMC'),
            spawn_scav: t('Scav'),
            spawn_boss: t('Boss'),
            'spawn_cultist-priest': t('Cultist Priest'),
            spawn_rogue: t('Rogue'),
            spawn_bloodhound: t('Bloodhound'),
            extract_pmc: t('PMC'),
            extract_scav: t('Scav'),
            extract_shared: t('Shared'),
            lock: t('Locks'),
        }

        let TL = {x:Number.MAX_SAFE_INTEGER, z:Number.MIN_SAFE_INTEGER};
        let BR = {x:Number.MIN_SAFE_INTEGER, z:Number.MAX_SAFE_INTEGER};

        // Add items (from test data for now)
        if (showTestMarkers) {
            for (const category in testMapData[mapData.normalizedName]) {
                const markerLayer = L.layerGroup();

                const items = testMapData[mapData.normalizedName][category];
                for (const item of items) {
                    const itemIcon = L.icon({
                        iconUrl: `${process.env.PUBLIC_URL}/maps/interactive/${category}.png`,
                        iconSize: [24, 24],
                        popupAnchor: [0, -12],
                        position: item.position,
                        className: !markerIsShown(heightLayer, item.position) ? 'off-level' : '',
                    });
                    L.marker(pos(item.position), {icon: itemIcon})
                        .bindPopup(L.popup().setContent(`${item.name}<br>Elevation: ${item.position.y.toFixed(2)}`))
                        .addTo(markerLayer);

                    if (item.position.x < TL.x) TL.x = item.position.x;
                    if (item.position.z > TL.z) TL.z = item.position.z;
                    if (item.position.x > BR.x) BR.x = item.position.x;
                    if (item.position.z < BR.z) BR.z = item.position.z;
                }

                if (items.length > 0) {
                    markerLayer.addTo(map);
                    layerControl.addOverlay(markerLayer, `<img src='${process.env.PUBLIC_URL}/maps/interactive/${category}.png' class='control-item-image' /> ${categories[category]}`, t('Items'));
                }
            }
        }

        // Add spawns
        if (mapData.spawns.length > 0) {
            const spawnLayers = {
                pmc: L.layerGroup(),
                scav: L.layerGroup(),
                boss: L.layerGroup(),
                'cultist-priest': L.layerGroup(),
                rogue: L.layerGroup(),
                bloodhound: L.layerGroup(),
            }
            for (const spawn of mapData.spawns) {
                let spawnType = '';
                let bosses = [];

                if (spawn.categories.includes('boss')) {
                    bosses = mapData.bosses.filter(boss => boss.spawnLocations.some(sl => sl.spawnKey === spawn.zoneName || sl.spawnKey === 'BotZone'));
                    if (bosses.length === 0) {
                        if (spawn.categories.includes('bot') && spawn.sides.includes('scav')) {
                            spawnType = 'scav';
                        }
                        else {
                            console.error(`Unusual spawn: ${spawn.sides}, ${spawn.categories}`);
                            continue;
                        }
                    }
                    else if (bosses.length === 1 && (bosses[0].normalizedName === 'bloodhound' || bosses[0].normalizedName === 'cultist-priest' || bosses[0].normalizedName === 'rogue')) {
                        spawnType = bosses[0].normalizedName;
                    }
                    else {
                        spawnType = 'boss';
                    }
                }
                else if (spawn.sides.includes('scav')) {
                    if (spawn.categories.includes('bot') || spawn.categories.includes('all')) {
                        spawnType = 'scav';
                    }
                    else {
                        console.error(`Unusual spawn: ${spawn.sides}, ${spawn.categories}`);
                        continue;
                    }
                } 
                else if (spawn.categories.includes('player')) {
                    if (spawn.sides.includes('pmc') || spawn.sides.includes('all')) {
                        spawnType = 'pmc'
                    }
                    else {
                        console.error(`Unusual spawn: ${spawn.sides}, ${spawn.categories}`);
                        continue;
                    }
                }
                else {
                    console.error(`Unusual spawn: ${spawn.sides}, ${spawn.categories}`);
                    continue;
                }

                const spawnIcon = L.icon({
                    iconUrl: `${process.env.PUBLIC_URL}/maps/interactive/spawn_${spawnType}.png`,
                    iconSize: [24, 24],
                    popupAnchor: [0, -12],
                    className: !markerIsShown(heightLayer, spawn.position) ? 'off-level' : '',
                    position: spawn.position,
                });

                if (spawnType === 'pmc') {
                    spawnIcon.iconAnchor = [12, 24];
                    spawnIcon.popupAnchor = [0, -24];
                }

                const popupLines = [];
                if (spawn.categories.includes('boss') && bosses.length > 0) {
                    bosses = bosses.reduce((unique, current) => {
                        if (!unique.some(b => b.normalizedName === current.normalizedName)) {
                            unique.push(current);
                        }
                        return unique;
                    }, []);
                    popupLines.push(bosses.map(boss => `<a href="/boss/${boss.normalizedName}">${boss.name} (${Math.round(boss.spawnChance*100)}%)</a>`).join(', '));
                    if (showTestMarkers) {
                        popupLines.push(spawn.zoneName);
                    }
                }
                popupLines.push(`Elevation: ${spawn.position.y.toFixed(2)}`);


                if (spawn.position.x < TL.x) TL.x = spawn.position.x;
                if (spawn.position.z > TL.z) TL.z = spawn.position.z;
                if (spawn.position.x > BR.x) BR.x = spawn.position.x;
                if (spawn.position.z < BR.z) BR.z = spawn.position.z;

                const marker = L.marker(pos(spawn.position), {icon: spawnIcon});
                if (popupLines.length > 0) {
                    marker.bindPopup(L.popup().setContent(popupLines.join('<br>')));
                }
                marker.position = spawn.position;
                marker.addTo(spawnLayers[spawnType]);
            }
            for (const key in spawnLayers) {
                if (Object.keys(spawnLayers[key]._layers).length > 0) {
                    spawnLayers[key].addTo(map);
                    layerControl.addOverlay(spawnLayers[key], `<img src='${process.env.PUBLIC_URL}/maps/interactive/spawn_${key}.png' class='control-item-image' /> ${categories[`spawn_${key}`]}`, t('Spawns'));    
                }
            }
        }

        //add extracts
        if (mapData.extracts.length > 0) {
            const extractLayers = {
                pmc: L.layerGroup(),
                scav: L.layerGroup(),
                shared: L.layerGroup(),
            }
            for (const extract of mapData.extracts) {
                const colorMap = {
                    scav: '#ff7800',
                    pmc: '#00e599',
                    shared: '#00e4e5',
                }
                const rect = L.rectangle(positionToBounds(extract), {color: colorMap[extract.faction], weight: 1});
                const extractIcon = L.icon({
                    iconUrl: `${process.env.PUBLIC_URL}/maps/interactive/extract_${extract.faction}.png`,
                    iconSize: [24, 24],
                    popupAnchor: [0, -12],
                    className: !markerIsShown(heightLayer, extract.position) ? 'off-level' : '',
                    position: extract.position,
                });
                const extractMarker = L.marker(pos(extract.position), {icon: extractIcon});
                extractMarker.bindPopup(L.popup().setContent(extract.name));
                L.layerGroup([rect, extractMarker]).addTo(extractLayers[extract.faction]);
            }
            for (const key in extractLayers) {
                if (Object.keys(extractLayers[key]._layers).length > 0) {
                    extractLayers[key].addTo(map);
                    layerControl.addOverlay(extractLayers[key], `<img src='${process.env.PUBLIC_URL}/maps/interactive/extract_${key}.png' class='control-item-image' /> ${categories[`extract_${key}`]}`, t('Extracts'));    
                }
            }
        }

        //add locks
        if (mapData.locks.length > 0) {
            const locks = L.layerGroup();
            for (const lock of mapData.locks) {
                const lockIcon = L.icon({
                    iconUrl: `${process.env.PUBLIC_URL}/maps/interactive/locked_door.png`,
                    iconSize: [24, 24],
                    popupAnchor: [0, -12],
                    className: !markerIsShown(heightLayer, lock.position) ? 'off-level' : '',
                    position: lock.position,
                });
                const lockMarker = L.marker(pos(lock.position), {icon: lockIcon});
                const key = items.find(i => i.id === lock.key.id);
                if (key) {
                    lockMarker.bindPopup(L.popup().setContent(`<a href="/item/${key.normalizedName}">${key.name}</a>`));
                    lockMarker.addTo(locks);
                }
            }
            if (Object.keys(locks._layers).length > 0) {
                locks.addTo(map);
                layerControl.addOverlay(locks, `<img src='${process.env.PUBLIC_URL}/maps/interactive/locked_door.png' class='control-item-image' /> ${categories['lock']}`, t('Locks'));    
            }
        }

        //add quest items

        const questItems = L.layerGroup();
        const questZones = L.layerGroup();
        for (const quest of quests) {
            for (const obj of quest.objectives) {
                if (obj.possibleLocations) {
                    for (const loc of obj.possibleLocations) {
                        if (loc.map.id !== mapData.id) {
                            continue;
                        }
                        for (const position of loc.positions) {
                            const questItemIcon = L.icon({
                                iconUrl: `${process.env.PUBLIC_URL}/maps/interactive/quest_item.png`,
                                iconSize: [24, 24],
                                popupAnchor: [0, -12],
                                className: !markerIsShown(heightLayer, pos) ? 'off-level' : '',
                                position: position,
                            });
                            const questItemMarker = L.marker(pos(position), {icon: questItemIcon});
                            questItemMarker.bindPopup(L.popup().setContent(`<a href="/task/${quest.normalizedName}">${obj.questItem.name}</a>`));
                            questItemMarker.addTo(questItems);
                        }
                    }
                }
                if (obj.zones) {
                    for (const zone of obj.zones) {
                        if (zone.map.id !== mapData.id) {
                            continue;
                        }
                        const rect = L.rectangle(positionToBounds(zone), {color: '#e5e200', weight: 1});
                        rect.bindPopup(L.popup().setContent(`<a href="/task/${quest.normalizedName}">${quest.name}<br>${obj.description}</a>`));
                        rect.addTo(questZones);
                    }
                }
            }
        }
        if (Object.keys(questItems._layers).length > 0) {
            questItems.addTo(map);
            layerControl.addOverlay(questItems, `<img src='${process.env.PUBLIC_URL}/maps/interactive/quest_item.png' class='control-item-image' /> ${categories['quest_item']}`, t('Tasks'));    
        }
        if (Object.keys(questZones._layers).length > 0) {
            questZones.addTo(map);
            layerControl.addOverlay(questZones, categories['quest_zone'], t('Tasks'));    
        }

        if (showTestMarkers) {
            console.log(`Positions "bounds": [[${BR.x}, ${BR.z}], [${TL.x}, ${TL.z}]] (already rotated, copy/paste to maps.json)`);

            const positionLayer = L.layerGroup();
            const playerIcon = L.AwesomeMarkers.icon({
                icon: 'person-running',
                prefix: 'fa',
                markerColor: 'green',
                position: {x: 0, y: 0, z: 0},
            });

            const positionMarker = L.marker([0,0], {icon: playerIcon}).addTo(positionLayer);
            const closeButton = L.DomUtil.create('a');
            closeButton.innerHTML = t('Clear');
            closeButton.addEventListener('click', () => {
                positionLayer.remove(positionMarker);
            });
            positionMarker.bindPopup(L.popup().setContent(closeButton));
            positionLayer.addTo(map);
            layerControl.addOverlay(positionLayer, t('Player'), t('Misc'));
        }

        // Add player position
        if (playerPosition && (playerPosition.map === mapData.key || playerPosition.map === null)) {
            const positionLayer = L.layerGroup();
            const playerIcon = L.AwesomeMarkers.icon({
                icon: 'person-running',
                prefix: 'fa',
                markerColor: 'green',
                position: playerPosition.position,
            });
                  
            const positionMarker = L.marker(pos(playerPosition.position), {icon: playerIcon}).addTo(positionLayer);
            const closeButton = L.DomUtil.create('a');
            closeButton.innerHTML = t('Clear');
            closeButton.addEventListener('click', () => {
                dispatch(setPlayerPosition(null));
            });
            positionMarker.bindPopup(L.popup().setContent(closeButton));
            positionLayer.addTo(map);
            layerControl.addOverlay(positionLayer, t('Player'), t('Misc'));
        }

        // Set default zoom level
        // map.fitBounds(bounds);
        // map.fitWorld({maxZoom: Math.max(mapData.maxZoom-3, mapData.minZoom)});

        // maxBounds are bigger than the map and the map center is not in 0,0 so we need to move the view to real center
        // console.log("Center:", L.latLngBounds(bounds).getCenter(true));
        map.setView(L.latLngBounds(bounds).getCenter(true), undefined, {animate: false});

        mapRef.current = map;
    }, [mapData, items, quests, mapRef, playerPosition, t, dispatch]);
    
    if (!mapData) {
        return <ErrorPage />;
    }

    return [
        <SEO 
            title={`${mapData.displayText} - ${t('Escape from Tarkov')} - ${t('Tarkov.dev')}`}
            description={mapData.description}
            image={`${window.location.origin}${process.env.PUBLIC_URL}${mapData.imageThumb}`}
            card='summary_large_image'
            key="seo-wrapper"
        />,
        <div className="display-wrapper" key="map-wrapper">
            <Time
                currentMap={currentMap}
                normalizedName={mapData.normalizedName}
                duration={mapData.duration}
                players={mapData.players}
                author={mapData.author}
                authorLink={mapData.authorLink}
            />
            {mapData.projection !== 'interactive' && (<TransformWrapper
                ref={ref}
                initialScale={1}
                centerOnInit={true}
                wheel={{
                    step: 0.1,
                }}
            >
                <TransformComponent>
                    <div className="map-image-wrapper">
                        <img
                            alt={`${mapData.displayText} ${t('Map')}`}
                            loading="lazy"
                            className="map-image"
                            title={`${mapData.displayText} ${t('Map')}`}
                            src={`${process.env.PUBLIC_URL}${mapData.image}`}
                        />
                    </div>
                </TransformComponent>
            </TransformWrapper>)}
            {mapData.projection === 'interactive' && (<div id="leaflet-map" ref={onMapContainerRefChange}  style={{height: '500px', backgroundColor: 'transparent'}}/>)}
        </div>,
    ];
}
export default Map;
