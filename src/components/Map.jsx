import { useEffect, useRef, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    TransformWrapper,
    TransformComponent,
} from 'react-zoom-pan-pinch';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import "@fortawesome/fontawesome-free/css/all.min.css";

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
import staticMapData from '../data/maps_static.json'

import Time from './Time';
import SEO from './SEO';

import ErrorPage from './error-page';

import './Maps.css';

const showOtherMarkers = true;
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

function checkMarkerBounds(position, markerBounds) {
    if (position.x < markerBounds.TL.x) markerBounds.TL.x = position.x;
    if (position.z > markerBounds.TL.z) markerBounds.TL.z = position.z;
    if (position.x > markerBounds.BR.x) markerBounds.BR.x = position.x;
    if (position.z < markerBounds.BR.z) markerBounds.BR.z = position.z;
}

function getBounds(mapData) {
    if (!mapData.bounds) {
        return undefined;
    }
    return [[mapData.bounds[0][1], mapData.bounds[0][0]], [mapData.bounds[1][1], mapData.bounds[1][0]]];
}

function markerIsOnActiveLayer(marker) {
    if (!marker.options.position) {
        return true;
    }
    var top = marker.options.top || marker.options.position.y;
    var bottom = marker.options.bottom || marker.options.position.y;
    let activeLayers = Object.values(marker._map._layers).filter(l => l.options?.heightRange);
    if (activeLayers.some(l => l.options.overlay)) {
        activeLayers = activeLayers.filter(l => l.options.overlay);
    }
    let onLevel = false;
    for (const layer of activeLayers) {
        const heightRange = layer.options.heightRange;
        if (top >= heightRange[0] && bottom < heightRange[1]) {
            onLevel = true;
            break;
        }
    }
    return onLevel;
}

function checkMarkerForActiveLayers(event) {
    const marker = event.target || event;
    const outline = marker.options.outline;
    /*if (!marker.options.position) {
        return;
    }
    var top = marker.options.top || marker.options.position.y;
    var bottom = marker.options.bottom || marker.options.position.y;
    let activeLayers = Object.values(marker._map._layers).filter(l => l.options?.heightRange);
    if (activeLayers.some(l => l.options.overlay)) {
        activeLayers = activeLayers.filter(l => l.options.overlay);
    }
    let onLevel = false;
    for (const layer of activeLayers) {
        const heightRange = layer.options.heightRange;
        if (top >= heightRange[0] && bottom < heightRange[1]) {
            onLevel = true;
            break;
        }
    }*/
    const onLevel = markerIsOnActiveLayer(marker);
    if (onLevel) {
        marker._icon?.classList.remove('off-level');
        if (outline) {
            outline._path?.classList.remove('off-level');
        }
    } else {
        marker._icon?.classList.add('off-level');
        if (outline) {
            outline._path?.classList.add('off-level');
        }
    }
}

function mouseHoverOutline(event) {
    const outline = event.target.options.outline;
    if (event.originalEvent.type === 'mouseover') {
        outline._path.classList.remove('not-shown');
    } else if (!outline._path.classList.contains('force-show')) {
        outline._path.classList.add('not-shown');
    }
}

function toggleForceOutline(event) {
    const outline = event.target.options.outline;
    outline._path.classList.toggle('force-show');
    if (outline._path.classList.contains('force-show')) {
        outline._path.classList.remove('not-shown');
    }
    activateMarkerLayer(event);
}

function activateMarkerLayer(event) {
    const marker = event.target || event;
    var top = marker.options.top || marker.options.position.y;
    var bottom = marker.options.bottom || marker.options.position.y;
    if (markerIsOnActiveLayer(marker)) {
        return;
    }
    const activeLayers = Object.values(marker._map._layers).filter(l => l.options?.heightRange && l.options?.overlay);
    for (const layer of activeLayers) {
        layer.removeFrom(marker._map);
    }
    const heightLayers = marker._map.layerControl._layers.filter(l => l.group.exclusive && l.layer.options.heightRange).map(l => l.layer);
    for (const layer of heightLayers) {
        const heightRange = layer.options.heightRange;
        if (top >= heightRange[0] && bottom < heightRange[1]) {
            layer.addTo(marker._map);
            break;
        }
    }
}

function outlineToPoly(outline) {
    if (!outline) return [];
    return outline.map(vector => [vector.z, vector.x]);
}

function Map() {
    let { currentMap } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const focusItem = useRef(searchParams.get('q') ? searchParams.get('q').split(',') : []);

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
        const tMaps = (string) => {
            return t(string, { ns: 'maps' })
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
            exclusiveGroups: [tMaps('Levels')],
        }).addTo(map);
        map.layerControl = layerControl;
        map.addControl(new L.Control.Fullscreen({
            title: {
                'false': tMaps('View Fullscreen'),
                'true': tMaps('Exit Fullscreen'),
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
        baseLayer.addTo(map);
        //layerControl.addBaseLayer(baseLayer, tMaps('Base'));

        // Add map layers
        if (mapData.layers) {
            for (const layer of mapData.layers) {
                let tileLayer;
                
                if (layer.svgPath) {
                    // if (process.env.NODE_ENV === "development") {
                    //     layer.svgPath = layer.svgPath.replace("assets.tarkov.dev/maps/svg", "raw.githubusercontent.com/the-hideout/tarkov-dev-src-maps/main/interactive");
                    // }
                    tileLayer = L.imageOverlay(layer.svgPath, bounds, {
                        heightRange: layer.heightRange || baseLayer.options?.heightRange,
                        type: 'layer-svg',
                        overlay: Boolean(layer.heightRange),
                    });
                }
                else {
                    tileLayer = L.tileLayer(layer.path, {
                        tileSize: mapData.tileSize,
                        bounds: bounds,
                        heightRange: layer.heightRange || baseLayer.options?.heightRange,
                        type: 'layer-tile',
                        overlay: Boolean(layer.heightRange),
                    });
                }
                layerControl.addOverlay(tileLayer, tMaps(layer.name), tMaps('Levels'));
                if (layer.show) {
                    tileLayer.addTo(map);
                }

                tileLayer.on('add', () => {
                    if (layer.heightRange) {
                        for (const marker of Object.values(map._layers)) {
                            checkMarkerForActiveLayers(marker);
                        }
                    }
                    if (baseLayer.options?.type === 'layer-svg' && !layer.show) {
                        baseLayer._image.classList.add('off-level');
                    }
                });
                tileLayer.on('remove', () => {
                    const heightLayer = Object.values(map._layers).findLast(l => l.options?.heightRange);
                    if (heightLayer) {
                        for (const marker of Object.values(map._layers)) {
                            checkMarkerForActiveLayers(marker);
                        }
                        const layers = Object.values(map._layers).filter(l => l.options.type === 'layer-svg');
                        if (layers.length === 1 && baseLayer.options.type === 'layer-svg') {
                            baseLayer._image.classList.remove('off-level');
                        }
                    }
                });
            }
        }

        const categories = {
            'extract_pmc': t('PMC'),
            'extract_shared': t('Shared'),
            'extract_scav': t('Scav'),
            'spawn_pmc': t('PMC'),
            'spawn_scav': t('Scav'),
            'spawn_boss': t('Boss'),
            'quest_item': t('Item'),
            'quest_objective': t('Objective'),
            'lock': t('Locks'),
            'wooden_crate': t('Wooden Crate'),
            'weapon_box': t('Weapon Box'),
            'jacket': t('Jacket'),
            'sportbag': t('Sports Bag'),
            'dead_scav': t('Dead Scav'),
            'medical_supplies': t('Medbag'),
            'file_cabinet': t('Drawer'),
            'safe': t('Safe'),
            'computer': t('PC'),
            'medcase': t('Medcase'),
            'stash': t('Ground Cache'),
            'key': t('Key Spawn'),
            'cash_register': t('Cash Register'),
            'ammo_box': t('Ammo Box'),
            'supply_crate': t('Technical Supply Crate'),
            'toolbox': t('Toolbox'),
            'grenade_box': t('Grenade Box'),
            'lever': t('Lever'),
            'stationarygun': t('Stationary Gun'),
            'switch': t('Switch'),
        };

        const focusOnPoi = (id) => {
            for (const marker of Object.values(map._layers)) {
                if (marker.options.id !== id) {
                    continue;
                }
                map.flyTo(pos(marker.options.position));
                marker.fire('click');
                return true;
            }
            return false;
        };
        const getPoiLinkElement = (id, imageName) => {
            const spanEl = L.DomUtil.create('div');
            spanEl.classList.add('poi-link');
            spanEl.addEventListener('click', () => {
                focusOnPoi(id);
            });
            const imgEl = L.DomUtil.create('img');
            imgEl.setAttribute('src', `${process.env.PUBLIC_URL}/maps/interactive/${imageName}.png`);
            //imgEl.setAttribute('title', id);
            imgEl.classList.add('poi-image');
            spanEl.append(imgEl);
            return spanEl;
        };

        const getReactLink = (path, contents) => {
            const a = L.DomUtil.create('a');
            a.setAttribute('href', path);
            a.append(contents);
            a.addEventListener('click', (event) => {
                navigate(path);
                event.preventDefault();
            });
            return a;
        };

        let markerBounds = {
            'TL': {x:Number.MAX_SAFE_INTEGER, z:Number.MIN_SAFE_INTEGER},
            'BR': {x:Number.MIN_SAFE_INTEGER, z:Number.MAX_SAFE_INTEGER}
        }

        // Add static items (from test data or static json)
        let otherMarkers;
        if (showTestMarkers) {
            otherMarkers = testMapData;
        }
        else {
            otherMarkers = staticMapData;
        }

        if (false && showOtherMarkers) {
            for (const category in otherMarkers[mapData.normalizedName]) {
                const markerLayer = L.layerGroup();

                const items = otherMarkers[mapData.normalizedName][category];
                for (const item of items) {
                    const itemIcon = L.icon({
                        iconUrl: `${process.env.PUBLIC_URL}/maps/interactive/${category}.png`,
                        iconSize: [24, 24],
                        popupAnchor: [0, -12],
                        //className: layerIncludesMarker(heightLayer, item) ? '' : 'off-level',
                    });
                    L.marker(pos(item.position), {icon: itemIcon, position: item.position})
                        .bindPopup(L.popup().setContent(`${item.name}<br>Elevation: ${item.position.y}`))
                        .addTo(markerLayer);

                    checkMarkerBounds(item.position, markerBounds);
                }

                if (items.length > 0) {
                    var section;
                    if (category.startsWith('extract')) {
                        section = t('Extract');
                    }
                    else {
                        section = t('Items');
                    }
                    markerLayer.addTo(map);
                    layerControl.addOverlay(markerLayer, `<img src='${process.env.PUBLIC_URL}/maps/interactive/${category}.png' class='control-item-image' /> ${categories[category] || category}`, section);
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
                });

                if (spawnType === 'pmc') {
                    spawnIcon.iconAnchor = [12, 24];
                    spawnIcon.popupAnchor = [0, -24];
                }

                const popupContent = L.DomUtil.create('div');
                if (spawn.categories.includes('boss') && bosses.length > 0) {
                    bosses = bosses.reduce((unique, current) => {
                        if (!unique.some(b => b.normalizedName === current.normalizedName)) {
                            unique.push(current);
                            if (!categories[`spawn_${current.normalizedName}`]) {
                                categories[`spawn_${current.normalizedName}`] = current.name;
                            }
                        }
                        return unique;
                    }, []);
                    const bossList = L.DomUtil.create('div', undefined, popupContent);
                    for (const boss of bosses) {
                        if (bossList.childNodes.length > 0) {
                            const comma = L.DomUtil.create('span', undefined, bossList);
                            comma.textContent = ', ';
                        }
                        bossList.append(getReactLink(`/boss/${boss.normalizedName}`, `${boss.name} (${Math.round(boss.spawnChance*100)}%)`));
                    }
                }
                else {
                    const spawnDiv = L.DomUtil.create('div', undefined, popupContent);
                    spawnDiv.textContent = categories[`spawn_${spawnType}`];
                }
                if (showTestMarkers) {
                    const elevationDiv = L.DomUtil.create('div', undefined, popupContent);
                    elevationDiv.textContent = `Elevation: ${spawn.position.y.toFixed(2)}`;
                }

                const marker = L.marker(pos(spawn.position), {
                    icon: spawnIcon,
                    position: spawn.position,
                });
                if (popupContent.childNodes.length > 0) {
                    marker.bindPopup(L.popup().setContent(popupContent));
                }
                marker.position = spawn.position;
                marker.on('add', checkMarkerForActiveLayers);
                marker.on('click', activateMarkerLayer);
                marker.addTo(spawnLayers[spawnType]);

                checkMarkerBounds(spawn.position, markerBounds);
            }
            for (const key in spawnLayers) {
                if (Object.keys(spawnLayers[key]._layers).length > 0) {
                    spawnLayers[key].addTo(map);
                    layerControl.addOverlay(spawnLayers[key], `<img src='${process.env.PUBLIC_URL}/maps/interactive/spawn_${key}.png' class='control-item-image' /> ${categories[`spawn_${key}`]}`, tMaps('Spawns'));    
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
            const zIndexOffsets = {
                pmc: 150,
                shared: 125,
                scav: 100,
            };
            for (const extract of mapData.extracts) {
                const colorMap = {
                    scav: '#ff7800',
                    pmc: '#00e599',
                    shared: '#00e4e5',
                }
                const rect = L.polygon(outlineToPoly(extract.outline), {color: colorMap[extract.faction], weight: 1, className: 'not-shown'});
                const extractIcon = L.divIcon({
                    className: 'extract-icon',
                    html: `<img src="${process.env.PUBLIC_URL}/maps/interactive/extract_${extract.faction}.png"/><span class="extract-name ${extract.faction}">${extract.name}</span>`,
                    iconAnchor: [12, 12]
                });
                const extractMarker = L.marker(pos(extract.position), {
                    icon: extractIcon,
                    title: extract.name,
                    zIndexOffset: zIndexOffsets[extract.faction],
                    position: extract.position,
                    top: extract.top,
                    bottom: extract.bottom,
                    outline: rect,
                    id: extract.id,
                });
                extractMarker.on('mouseover', mouseHoverOutline);
                extractMarker.on('mouseout', mouseHoverOutline);
                extractMarker.on('click', toggleForceOutline);
                if (extract.switches?.length > 0) {
                    const popup = L.DomUtil.create('div');
                    const textElement = L.DomUtil.create('div');
                    textElement.textContent = t('Activated by:');
                    popup.appendChild(textElement);
                    for (const sw of extract.switches) {
                        const linkElement = getPoiLinkElement(sw.id, 'lever');
                        const nameElement = L.DomUtil.create('span');
                        nameElement.innerHTML = `<strong>${sw.name}</strong>`;
                        linkElement.append(nameElement);
                        popup.appendChild(linkElement);
                    }
                    extractMarker.bindPopup(L.popup().setContent(popup));
                }
                extractMarker.on('add', checkMarkerForActiveLayers);
                L.layerGroup([rect, extractMarker]).addTo(extractLayers[extract.faction]);

                checkMarkerBounds(extract.position, markerBounds);
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
            for (const lock of mapData.locks) {const key = items.find(i => i.id === lock.key.id);
                if (!key) {
                    continue;
                }

                checkMarkerBounds(lock.position, markerBounds);
                const lockIcon = L.icon({
                    iconUrl: `${process.env.PUBLIC_URL}/maps/interactive/locked_door.png`,
                    iconSize: [24, 24],
                    popupAnchor: [0, -12],
                });
                var lockType;
                if (lock.lockType === 'door') {
                    lockType = t('Door');
                }
                else if (lock.lockType === 'container') {
                    lockType = t('Container');
                }
                else if (lock.lockType === 'trunk') {
                    lockType = t('Car Door or Trunk');
                }
                else {
                    lockType = t('Lock');
                }
                
                const lockMarker = L.marker(pos(lock.position), {
                    icon: lockIcon,
                    position: lock.position,
                    title: `${t('Lock')}: ${key.name}`,
                });

                const popupContent = L.DomUtil.create('div');
                const lockTypeNode = L.DomUtil.create('div', undefined, popupContent);
                lockTypeNode.innerText = `${lockType}`;
                if (lock.needsPower) {
                    const powerNode = L.DomUtil.create('div', undefined, popupContent);
                    powerNode.innerText = 'Needs power';
                }
                const lockImage = L.DomUtil.create('img', 'popup-item');
                lockImage.setAttribute('src', `${key.baseImageLink}`);
                const lockLink = getReactLink(`/item/${key.normalizedName}`, lockImage);
                lockLink.append(`${key.name}`);
                popupContent.append(lockLink);
                if (showTestMarkers) {
                    const elevationDiv = L.DomUtil.create('div', undefined, popupContent);
                    elevationDiv.textContent = `Elevation: ${lock.position.y.toFixed(2)}`;
                }

                lockMarker.bindPopup(L.popup().setContent(popupContent));
                lockMarker.on('add', checkMarkerForActiveLayers);
                lockMarker.on('click', activateMarkerLayer);
                lockMarker.addTo(locks);
                
            }
            if (Object.keys(locks._layers).length > 0) {
                locks.addTo(map);
                layerControl.addOverlay(locks, `<img src='${process.env.PUBLIC_URL}/maps/interactive/locked_door.png' class='control-item-image' /> ${categories['lock']}`, t('Locks'));    
            }
        }

        //add quest markers
        const questItems = L.layerGroup();
        const questObjectives = L.layerGroup();
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
                            });
                            const questItemMarker = L.marker(pos(position), {
                                icon: questItemIcon,
                                position: position,
                                title: obj.questItem.name,
                                id: obj.questItem.id,
                            });
                            const popupContent = L.DomUtil.create('div');
                            const questLink = getReactLink(`/task/${quest.normalizedName}`, quest.name);
                            popupContent.append(questLink);
                            const questItem = L.DomUtil.create('div', 'popup-item', popupContent);
                            const questItemImage = L.DomUtil.create('img', 'popup-item', questItem);
                            questItemImage.setAttribute('src', `${obj.questItem.baseImageLink}`);
                            questItem.append(`${obj.questItem.name}`);
                            if (showTestMarkers) {
                                const elevationDiv = L.DomUtil.create('div', undefined, popupContent);
                                elevationDiv.textContent = `Elevation: ${position.y.toFixed(2)}`;
                            }
                            questItemMarker.bindPopup(L.popup().setContent(popupContent));
                            questItemMarker.on('add', checkMarkerForActiveLayers);
                            questItemMarker.on('click', activateMarkerLayer);
                            questItemMarker.addTo(questItems);

                            checkMarkerBounds(position, markerBounds);
                        }
                    }
                }
                if (obj.zones) {
                    for (const zone of obj.zones) {
                        if (zone.map.id !== mapData.id) {
                            continue;
                        }
                        const rect = L.polygon(outlineToPoly(zone.outline), {color: '#e5e200', weight: 1, className: 'not-shown'});
                        const zoneIcon = L.icon({
                            iconUrl: `${process.env.PUBLIC_URL}/maps/interactive/compass.png`,
                            iconSize: [24, 24],
                            popupAnchor: [0, -12],
                        });
                        
                        const zoneMarker = L.marker(pos(zone.position), {
                            icon: zoneIcon,
                            title: obj.description,
                            position: zone.position,
                            top: zone.top,
                            bottom: zone.bottom,
                            outline: rect,
                            id: zone.id,
                        });
                        /*zoneMarker.on('click', (e) => {
                            rect._path.classList.toggle('not-shown');
                        });*/
                        zoneMarker.on('mouseover', mouseHoverOutline);
                        zoneMarker.on('mouseout', mouseHoverOutline);
                        zoneMarker.on('click', toggleForceOutline);
                        const popupContent = L.DomUtil.create('div');
                        const questLink = L.DomUtil.create('div', undefined, popupContent);
                        questLink.append(getReactLink(`/task/${quest.normalizedName}`, quest.name));
                        const objectiveText = L.DomUtil.create('div', undefined, popupContent);
                        objectiveText.textContent = `- ${obj.description}`;
                        zoneMarker.bindPopup(L.popup().setContent(popupContent));
                        zoneMarker.on('add', checkMarkerForActiveLayers);
                        L.layerGroup([rect, zoneMarker]).addTo(questObjectives);
                    }
                }
            }
        }
        if (Object.keys(questItems._layers).length > 0) {
            questItems.addTo(map);
            layerControl.addOverlay(questItems, `<img src='${process.env.PUBLIC_URL}/maps/interactive/quest_item.png' class='control-item-image' /> ${categories['quest_item']}`, t('Tasks'));    
        }
        if (Object.keys(questObjectives._layers).length > 0) {
            questObjectives.addTo(map);
            layerControl.addOverlay(questObjectives, `<img src='${process.env.PUBLIC_URL}/maps/interactive/compass.png' class='control-item-image' /> ${categories['quest_objective']}`, t('Tasks')); 
        }
        /*if (Object.keys(questZones._layers).length > 0) {
            questZones.addTo(map);
            layerControl.addOverlay(questZones, categories['quest_zone'], t('Tasks'));    
        }*/

        //add switches 
        if (mapData.switches.length > 0) {
            const switches = L.layerGroup();
            for (const sw of mapData.switches) {
                const switchIcon = L.icon({
                    iconUrl: `${process.env.PUBLIC_URL}/maps/interactive/lever.png`,
                    iconSize: [24, 24],
                    popupAnchor: [0, -12],
                });
                const switchMarker = L.marker(pos(sw.position), {
                    icon: switchIcon,
                    position: sw.position,
                    id: sw.id,
                });
                /*const popupLines = [t(sw.id)];
                if (sw.previousSwitch) {
                    popupLines.push(`Activated by ${sw.previousSwitch.id}`);
                }
                for (const nextSwitch of sw.nextSwitches) {
                    popupLines.push(`${nextSwitch.operation} ${nextSwitch.switch.id}`);
                }
                switchMarker.bindPopup(L.popup().setContent(popupLines.join('<br>')));*/
                const popup = L.DomUtil.create('div');
                const switchNameElement = L.DomUtil.create('div');
                switchNameElement.innerHTML = `<strong>${sw.name}</strong>`;
                popup.append(switchNameElement);
                if (sw.activatedBy) {
                    const textElement = L.DomUtil.create('div');
                    textElement.textContent = `${t('Activated by')}:`;
                    popup.appendChild(textElement);
                    const linkElement = getPoiLinkElement(sw.activatedBy.id, 'lever');
                    const nameElement = L.DomUtil.create('span');
                    nameElement.innerHTML = `<strong>${sw.activatedBy.name}</strong>`;
                    linkElement.append(nameElement);
                    popup.appendChild(linkElement);
                }
                if (sw.activates.length > 0) {
                    const textElement = L.DomUtil.create('div');
                    textElement.textContent = `${t('Activates')}:`;
                    popup.append(textElement);
                }
                for (const switchOperation of sw.activates) {
                    if (switchOperation.target.__typename === 'MapSwitch') {
                        const linkElement = getPoiLinkElement(switchOperation.target.id, 'lever');
                        const nameElement = L.DomUtil.create('span');
                        nameElement.innerHTML = `<strong>${switchOperation.target.name}</strong>`;
                        linkElement.append(nameElement);
                        popup.appendChild(linkElement);
                    } else {
                        const extractElement = L.DomUtil.create('div');
                        const linkElement = getPoiLinkElement(switchOperation.target.id, `extract_${switchOperation.target.faction}`);
                        const spanElement = L.DomUtil.create('span');
                        spanElement.classList.add('extract-name', switchOperation.target.faction);
                        spanElement.textContent = switchOperation.target.name;
                        linkElement.append(spanElement);
                        extractElement.append(linkElement);
                        popup.appendChild(extractElement);
                    }
                }
                if (popup.childNodes.length > 0) {
                    switchMarker.bindPopup(L.popup().setContent(popup));
                }
                switchMarker.on('add', checkMarkerForActiveLayers);
                switchMarker.on('click', activateMarkerLayer);
                switchMarker.addTo(switches);

                checkMarkerBounds(sw.position, markerBounds);
            }
            if (Object.keys(switches._layers).length > 0) {
                switches.addTo(map);
                layerControl.addOverlay(switches, `<img src='${process.env.PUBLIC_URL}/maps/interactive/lever.png' class='control-item-image' /> ${categories['switch']}`, t('Switches'));    
            }
        }

        //add loot containers
        if (mapData.lootContainers.length > 0) {
            const containerLayers = {};
            const containerNames = {};
            for (const containerPosition of mapData.lootContainers) {
                const containerIcon = L.icon({
                    iconUrl: `${process.env.PUBLIC_URL}/maps/interactive/container_${containerPosition.lootContainer.normalizedName}.png`,
                    iconSize: [24, 24],
                    popupAnchor: [0, -12],
                });
                
                const containerMarker = L.marker(pos(containerPosition.position), {
                    icon: containerIcon, 
                    title: containerPosition.lootContainer.name,
                    position: containerPosition.position,
                });
                if (!containerLayers[containerPosition.lootContainer.normalizedName]) {
                    containerLayers[containerPosition.lootContainer.normalizedName] = L.layerGroup();
                }
                containerMarker.on('add', checkMarkerForActiveLayers);
                containerMarker.on('click', activateMarkerLayer);
                containerMarker.addTo(containerLayers[containerPosition.lootContainer.normalizedName]);
                containerNames[containerPosition.lootContainer.normalizedName] = containerPosition.lootContainer.name;
            }
            for (const key in containerLayers) {
                if (Object.keys(containerLayers[key]._layers).length > 0) {
                    containerLayers[key].addTo(map);
                    layerControl.addOverlay(containerLayers[key], `<img src='${process.env.PUBLIC_URL}/maps/interactive/container_${key}.png' class='control-item-image' /> ${containerNames[key]}`, t('Items'));    
                }
            }
        }

        //add hazards
        if (mapData.hazards.length > 0) {
            const hazardLayers = {};
            for (const hazard of mapData.hazards) {
                const rect = L.polygon(outlineToPoly(hazard.outline), {color: '#ff0000', weight: 1, className: 'not-shown'});
                const hazardIcon = L.icon({
                    iconUrl: `${process.env.PUBLIC_URL}/maps/interactive/hazard.png`,
                    iconSize: [24, 24],
                    popupAnchor: [0, -12],
                });
                
                const hazardMarker = L.marker(pos(hazard.position), {
                    icon: hazardIcon, 
                    title: hazard.name, 
                    zIndexOffset: -100,
                    position: hazard.position,
                    top: hazard.top,
                    bottom: hazard.bottom,
                    outline: rect,
                });
                hazardMarker.bindPopup(L.popup().setContent(hazard.name));
                /*hazardMarker.on('click', (e) => {
                    rect._path.classList.toggle('not-shown');
                });*/
                hazardMarker.on('mouseover', mouseHoverOutline);
                hazardMarker.on('mouseout', mouseHoverOutline);
                hazardMarker.on('click', toggleForceOutline);
                hazardMarker.on('add', checkMarkerForActiveLayers);
                if (!hazardLayers[hazard.name]) {
                    hazardLayers[hazard.name] = L.layerGroup()
                }
                L.layerGroup([rect, hazardMarker]).addTo(hazardLayers[hazard.name]);

                checkMarkerBounds(hazard.position, markerBounds);
            }
            for (const key in hazardLayers) {
                if (Object.keys(hazardLayers[key]._layers).length > 0) {
                    hazardLayers[key].addTo(map);
                    layerControl.addOverlay(hazardLayers[key], key, t('Hazards'));    
                }
            }
        }

        // add stationary weapons
        if (mapData.stationaryWeapons.length > 0) {
            const stationaryWeapons = L.layerGroup();
            for (const weaponPosition of mapData.stationaryWeapons) {
                const weaponIcon = L.icon({
                    iconUrl: `${process.env.PUBLIC_URL}/maps/interactive/stationarygun.png`,
                    iconSize: [24, 24],
                    popupAnchor: [0, -12],
                });
                
                const weaponMarker = L.marker(pos(weaponPosition.position), {
                    icon: weaponIcon, 
                    title: weaponPosition.stationaryWeapon.name,
                    position: weaponPosition.position,
                });
                weaponMarker.on('add', checkMarkerForActiveLayers);
                weaponMarker.on('click', activateMarkerLayer);
                weaponMarker.addTo(stationaryWeapons);
            }
            stationaryWeapons.addTo(map);
            layerControl.addOverlay(stationaryWeapons, `<img src='${process.env.PUBLIC_URL}/maps/interactive/stationarygun.png' class='control-item-image' /> ${categories.stationarygun}`, t('Stationary Guns'));    
        }

        if (showTestMarkers) {
            console.log(`Markers "bounds": [[${markerBounds.BR.x}, ${markerBounds.BR.z}], [${markerBounds.TL.x}, ${markerBounds.TL.z}]] (already rotated, copy/paste to maps.json)`);

            L.rectangle([pos(markerBounds.TL), pos(markerBounds.BR)], {color: '#ff000055', weight: 1}).addTo(map);
            L.rectangle(getBounds(mapData), {color: '#00ff0055', weight: 1}).addTo(map);

            const positionLayer = L.layerGroup();
            const playerIcon = L.AwesomeMarkers.icon({
                icon: 'person-running',
                prefix: 'fa',
                markerColor: 'green',
                position: {x: 0, y: 0, z: 0},
            });

            const positionMarker = L.marker([0,0], {icon: playerIcon}).addTo(positionLayer);
            const closeButton = L.DomUtil.create('a');
            closeButton.innerHTML = tMaps('Clear');
            closeButton.addEventListener('click', () => {
                positionLayer.remove(positionMarker);
            });
            positionMarker.bindPopup(L.popup().setContent(closeButton));
            positionLayer.addTo(map);
            layerControl.addOverlay(positionLayer, tMaps('Player'), tMaps('Misc'));
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
            closeButton.innerHTML = tMaps('Clear');
            closeButton.addEventListener('click', () => {
                dispatch(setPlayerPosition(null));
            });
            positionMarker.bindPopup(L.popup().setContent(closeButton));
            positionLayer.addTo(map);
            layerControl.addOverlay(positionLayer, tMaps('Player'), tMaps('Misc'));
        }

        // Set default zoom level
        // map.fitBounds(bounds);
        // map.fitWorld({maxZoom: Math.max(mapData.maxZoom-3, mapData.minZoom)});

        // maxBounds are bigger than the map and the map center is not in 0,0 so we need to move the view to real center
        // console.log("Center:", L.latLngBounds(bounds).getCenter(true));
        map.setView(L.latLngBounds(bounds).getCenter(true), undefined, {animate: false});

        mapRef.current = map;
        if (focusItem.current) {
            for (const id of focusItem.current) {
                if (focusOnPoi(id)) {
                    //focusItem.current = false;
                    break;
                }
            }
        }
    }, [mapData, items, quests, mapRef, playerPosition, t, dispatch, navigate]);
    
    if (!mapData) {
        return <ErrorPage />;
    }

    return [
        <SEO 
            title={`${t('Map')} - ${mapData.displayText} - ${t('Escape from Tarkov')} - ${t('Tarkov.dev')}`}
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
