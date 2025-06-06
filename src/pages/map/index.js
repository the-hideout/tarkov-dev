import { useEffect, useRef, useMemo, useCallback, useLayoutEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    TransformWrapper,
    TransformComponent,
} from 'react-zoom-pan-pinch';
import ResizeObserver from 'resize-observer-polyfill';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-fullscreen/dist/Leaflet.fullscreen.js';
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css';
import '../../modules/leaflet-control-coordinates.js';
import '../../modules/leaflet-control-groupedlayer.js';
import '../../modules/leaflet-control-raid-info.js';
import '../../modules/leaflet-control-map-search.js';
import '../../modules/leaflet-control-map-settings.js';

import { setPlayerPosition } from '../../features/settings/settingsSlice.mjs';

import { useMapImages } from '../../features/maps/index.js';
import useItemsData from '../../features/items/index.js';
import useQuestsData from '../../features/quests/index.js';

import staticMapData from '../../data/maps_static.json'
import rawMapsData from '../../data/maps.json';

import Time from '../../components/Time.jsx';
import SEO from '../../components/SEO.jsx';

import ErrorPage from '../error-page/index.js';

import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage.jsx';

import './index.css';
import images from './map-images.mjs';

const showStaticMarkers = false;
const showMarkersBounds = false;
const showTestMarkers = false;
const showElevation = false;

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

function getBounds(bounds) {
    if (!bounds) {
        return undefined;
    }
    return L.latLngBounds([bounds[0][1], bounds[0][0]], [bounds[1][1], bounds[1][0]]);
    //return [[bounds[0][1], bounds[0][0]], [bounds[1][1], bounds[1][0]]];
}

function markerIsOnLayer(marker, layer) {
    if (!layer.options.extents) {
        return true;
    }
    var top = marker.options.top || marker.options.position.y;
    var bottom = marker.options.bottom || marker.options.position.y;
    for (const extent of layer.options.extents) {
        if (top >= extent.height[0] && bottom < extent.height[1]) {
            let containedType = 'partial';
            if (bottom >= extent.height[0] && top <= extent.height[1]) {
                containedType = 'full';
            }
            if (extent.bounds) {
                for (const boundsArray of extent.bounds) {
                    const bounds = getBounds(boundsArray);
                    if (bounds.contains(pos(marker.options.position))) {
                        return containedType;
                    }
                }
            } else {
                return containedType;
            }
        }
    }
    return false;
}

function markerIsOnActiveLayer(marker) {
    if (!marker.options.position) {
        return true;
    }

    const map = marker._map;

    // check if marker is completely contained by inactive layer
    const overlays = map.layerControl._layers.map(l => l.layer).filter(l => Boolean(l.options.extents) && l.options.overlay);
    for (const layer of overlays) {
        for (const extent of layer.options.extents) {
            if (markerIsOnLayer(marker, layer) === 'full' && !map.hasLayer(layer) && extent.bounds) {
                return false;
            }
        }
    }

    // check if marker is on active overlay
    const activeOverlay = Object.values(map._layers).find(l => l.options?.extents && l.options?.overlay);
    if (activeOverlay && markerIsOnLayer(marker, activeOverlay)) {
        return true;
    }

    // check if marker is on base layer
    const baseLayer = Object.values(map._layers).find(l => l.options?.extents && !L.options?.overlay);
    if (!activeOverlay && markerIsOnLayer(marker, baseLayer)) {
        return true;
    }

    return false;
}

function checkMarkerForActiveLayers(event) {
    const marker = event.target || event;
    const outline = marker.options.outline;
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
    /*if (marker.options.activeQuest === true) {
        marker._icon.classList.add('active-quest-marker');
        marker._icon.classList.remove('inactive-quest-marker');
    } else if (marker.options.activeQuest === false) {
        marker._icon.classList.remove('active-quest-marker');
        marker._icon.classList.add('inactive-quest-marker');
    }*/
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
    if (markerIsOnActiveLayer(marker)) {
        return;
    }
    const activeLayers = Object.values(marker._map._layers).filter(l => l.options?.extents && l.options?.overlay);
    for (const layer of activeLayers) {
        layer.removeFrom(marker._map);
    }
    const heightLayers = marker._map.layerControl._layers.filter(l => l.layer.options.extents && l.layer.options.overlay).map(l => l.layer);
    for (const layer of heightLayers) {
        if (markerIsOnLayer(marker, layer)) {
            layer.addTo(marker._map);
            break;
        }
    }
}

function outlineToPoly(outline) {
    if (!outline) return [];
    return outline.map(vector => [vector.z, vector.x]);
}

function addElevation(item, popup) {
    if (!showElevation) {
        return;
    }
    const elevationContent = L.DomUtil.create('div', undefined, popup);
    elevationContent.textContent = `Elevation: ${item.position.y.toFixed(2)}`;
    if (item.top && item.bottom && item.top !== item.position.y && item.bottom !== item.position.y) {
        const heightContent = L.DomUtil.create('div', undefined, popup);
        heightContent.textContent = `Top ${item.top.toFixed(2)}, bottom: ${item.bottom.toFixed(2)}`;
    }
}

function Map() {
    let { currentMap } = useParams();
    const [searchParams] = useSearchParams();

    const settings = useSelector((state) => state.settings[state.settings.gameMode]);

    const focusItem = useRef(searchParams.get('q') ? searchParams.get('q').split(',') : []);

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const tMaps = useCallback((string) => {
        return t(string, { ns: 'maps' })
    }, [t]);

    const [savedMapSettings, setSavedMapSettings] = useStateWithLocalStorage(
        'savedMapSettings',
        {
            style: 'svg',
            hiddenGroups: [],
            hiddenLayers: [],
            collapsedGroups: [],
            showOnlyActiveTasks: false,
        },
    );

    const mapSettingsRef = useRef(savedMapSettings);
    const updateSavedMapSettings = useCallback(() => {
        setSavedMapSettings({...mapSettingsRef.current});
    }, [setSavedMapSettings]);

    const markerBoundsRef = useRef({});

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

    const [mapHeight, setMapHeight] = useState(500);
    useLayoutEffect(() => {
        function updateSize() {
            const menuHeight = document.querySelector('.navigation')?.offsetHeight || 0;
            const bannerHeight = document.querySelector('.MuiBox-root')?.offsetHeight || 0;
            const cookieConsentHeight = document.querySelector('.CookieConsent')?.offsetHeight || 0;
            let viewableHeight = window.innerHeight - menuHeight - bannerHeight - cookieConsentHeight;
            if (viewableHeight < 100) {
                viewableHeight = window.innerHeight;
            }
            setMapHeight(viewableHeight);
        }
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    useEffect(() => {
        const mapContainer = document.getElementById('leaflet-map');
        if (mapContainer) {
            mapContainer.style.height = `${mapHeight}px`;
        }
    }, [mapHeight]);

    const onMapContainerRefChange = useCallback(node => {
        if (node) {
            node.style.height = `${mapHeight}px`;
        }
        if (mapRef.current) {
            mapRef.current.invalidateSize({animate: false});
        }
    }, [mapHeight]);

    useEffect(() => {
        ref?.current?.resetTransform();
    }, [currentMap]);

    const { data: items } = useItemsData();
    const { data: quests} = useQuestsData();

    let allMaps = useMapImages();

    const mapData = useMemo(() => {
        return allMaps[currentMap];
    }, [allMaps, currentMap]);

    // create the leaflet map on first page render
    useEffect(() => {
        if (mapRef.current) {
            return;
        }
        const map = L.map('leaflet-map', {
            zoomSnap: 0.1,
            scrollWheelZoom: true,
            wheelPxPerZoomLevel: 120,
            attributionControl: false,
            crs: L.CRS.Simple,
            maxBounds: [[0,0], [10,10]],
            minZoom: 1,
            maxZoom: 1,
        });

        const layerControl = L.control.groupedLayers(null, null, {
            position: 'topleft',
            collapsed: true,
            groupCheckboxes: true,
            groupsCollapsable: true,
            exclusiveOptionalGroups: [tMaps('Levels')],
        }).addTo(map);
        layerControl.on('layerToggle', (e) => {
            const layerState = e.detail;
            if (!layerState.checked) {
                mapSettingsRef.current.hiddenLayers.push(layerState.key);
            } else {
                mapSettingsRef.current.hiddenLayers = mapSettingsRef.current.hiddenLayers.filter(key => key !== layerState.key);
            }
            updateSavedMapSettings();
        });
        layerControl.on('groupToggle', (e) => {
            const groupState = e.detail;
            for (const groupLayer of layerControl._layers) {
                if (groupLayer.group?.key !== groupState.key) {
                    continue;
                }
                if (!groupState.checked) {
                    mapSettingsRef.current.hiddenLayers.push(groupLayer.key);
                } else {
                    mapSettingsRef.current.hiddenLayers = mapSettingsRef.current.hiddenLayers.filter(key => key !== groupLayer.key);
                }
            }
            if (!groupState.checked) {
                mapSettingsRef.current.hiddenGroups.push(groupState.key);
            } else {
                mapSettingsRef.current.hiddenGroups = mapSettingsRef.current.hiddenGroups.filter(key => key !== groupState.key);
            }
            updateSavedMapSettings();
        });
        layerControl.on('groupCollapseToggle', (e) => {
            const groupState = e.detail;
            if (groupState.collapsed) {
                mapSettingsRef.current.collapsedGroups.push(groupState.key);
                
            } else {
                mapSettingsRef.current.collapsedGroups = mapSettingsRef.current.collapsedGroups.filter(key => key !== groupState.key);
            }
            updateSavedMapSettings();
        });

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
            position: 'bottomright',
            customLabelFcn: (latLng, opts) => {
                return `x: ${latLng.lng.toFixed(2)} z: ${latLng.lat.toFixed(2)}`;
            }
        }).addTo(map);

        map.settingsControl = L.control.mapSettings({
            hidden: false,
            position: 'bottomright',
            checked: mapSettingsRef.current.showOnlyActiveTasks,
            activeTasksLabel: t('Only Active Tasks'),
            settingChanged: (settingName, settingValue) => {
                mapSettingsRef.current[settingName] = settingValue;
                updateSavedMapSettings();
            },
        }).addTo(map);

        map.raidInfoControl = L.control.raidInfo({
            position: 'topright',
            durationLabel: t('Duration'),
            playersLabel: t('Players'),
            bylabel: t('By'),
        }).addTo(map);

        map.searchControl = L.control.mapSearch({
            placeholderText: t('Task, item or container...'),
            descriptionText: t("Supports multisearch (e.g. 'labs, ledx, bitcoin')"),
        }).addTo(map);

        //L.control.scale({position: 'bottomright'}).addTo(map);

        mapRef.current = map;

        
        const mapDiv = document.getElementById('leaflet-map');
        const resizeObserver = new ResizeObserver(() => {
            //map.invalidateSize();
            //window.dispatchEvent(new Event('resize'));
        });
        resizeObserver.observe(mapDiv);
    }, [t, tMaps, updateSavedMapSettings]);

    useEffect(() => {
        if (!mapRef.current?.searchControl) {
            return;
        }
        mapRef.current.searchControl.options.quests = quests;
    }, [quests]);

    useEffect(() => {
        if (!mapRef.current?.settingsControl?.container) {
            return;
        }
        if (settings.useTarkovTracker) {
            mapRef.current.settingsControl.container.style.display = '';
            mapSettingsRef.current.showOnlyActiveTasks = mapRef.current.settingsControl.container.querySelector('#only-active-quest-markers').checked;
        } else {
            mapRef.current.settingsControl.container.style.display = 'none';
            mapSettingsRef.current.showOnlyActiveTasks = false;
        }
        updateSavedMapSettings();
    }, [settings, updateSavedMapSettings]);

    const categories = useMemo(() => {
        return {
            'extract_pmc': tMaps('PMC'),
            'extract_shared': tMaps('Shared'),
            'extract_scav': tMaps('Scav'),
            'extract_transit': tMaps('Transit'),
            'spawn_sniper_scav': tMaps('Sniper Scav'),
            'spawn_pmc': tMaps('PMC'),
            'spawn_scav': tMaps('Scav'),
            'spawn_boss': tMaps('Boss'),
            'quest_item': tMaps('Item'),
            'quest_objective': tMaps('Objective'),
            'lock': tMaps('Locks'),
            'lever': tMaps('Lever'),
            'stationarygun': tMaps('Stationary Gun'),
            'switch': tMaps('Switch'),
            'place-names': tMaps('Place Names'),
        };
    }, [tMaps]);

    const getLayerOptions = useCallback((layerKey, groupKey, layerName) => {
        return {
            groupKey,
            layerKey,
            groupName: tMaps(groupKey),
            layerName: layerName || categories[layerKey] || layerKey,
            groupHidden: Boolean(mapSettingsRef.current.hiddenGroups?.includes(groupKey)),
            layerHidden: Boolean(mapSettingsRef.current.hiddenLayers?.includes(layerKey)),
            image: images[layerKey] ? `${process.env.PUBLIC_URL}/maps/interactive/${images[layerKey]}.png` : undefined,
            groupCollapsed: Boolean(mapSettingsRef.current.collapsedGroups?.includes(groupKey)),
        };
    }, [tMaps, categories]);

    const addLayer = useCallback((layer, layerKey, groupKey, layerName) => {
        /*for (const layerId in layer._layers) {
            const l = layer._layers[layerId];
            l.options.layerKey = layerKey;
            l.options.groupKey = groupKey;
        };*/
        layer.key = layerKey;
        const layerOptions = getLayerOptions(layerKey, groupKey, layerName);
        if (!layerOptions.layerHidden) {
            layer.addTo(mapRef.current);
        }
        mapRef.current.layerControl.addOverlay(layer, layerOptions.layerName, layerOptions);
    }, [getLayerOptions]);

    const getReactLink = (path, contents) => {
        const a = L.DomUtil.create('a');
        a.setAttribute('href', path);
        a.setAttribute('target', '_blank');
        a.append(contents);
        // a.addEventListener('click', (event) => {
        //     navigate(path);
        //     event.preventDefault();
        // });
        return a;
    };

    const focusOnPoi = (id) => {
        for (const marker of Object.values(mapRef.current._layers)) {
            if (marker.options.id !== id) {
                continue;
            }
            mapRef.current.flyTo(pos(marker.options.position));
            marker.fire('click');
            return true;
        }
        return false;
    };

    const getPoiLinkElement = useCallback((id, imageName) => {
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
    }, []);

    const positionIsInBounds = (position) => {
        const bounds = getBounds(mapRef.current.options.baseData.bounds);
        return bounds.contains(pos(position));
    };

    // load base layers when map changed
    useEffect (() => {
        if (!currentMap || !mapRef.current) {
            return;
        }
        if (mapRef.current.options.id === currentMap) {
            return;
        }
        const interactiveMaps = rawMapsData.reduce((interactive, current) => {
            const int = current.maps.find(m => m.projection === 'interactive');
            if (int) {
                interactive.push(int);
            }
            return interactive;
        }, []);
        const mapData = interactiveMaps.find(m => m.key === currentMap || m.altMaps?.includes(currentMap));
        if (!mapData) {
            return;
        }
        
        const maxZoom = Math.max(7, mapData.maxZoom);
        const map = mapRef.current;
        map.options.baseData = mapData;
        const layerControl = map.layerControl;

        map.options.maxBounds = getScaledBounds(mapData.bounds, 1.5);
        map.setMaxBounds(map.options.maxBounds);
        map.options.minZoom = mapData.minZoom;
        map.setMinZoom(mapData.minZoom);
        map.options.maxZoom = maxZoom;
        map.setMaxZoom(maxZoom);
        map.options.crs = getCRS(mapData);
        map.options.id = currentMap;

        const bounds = getBounds(mapData.bounds);

        map.eachLayer(layer => {
            if (layer.options.type !== 'map-layer') {
                return;
            }
            layer.removeFrom(map);
        });

        const layerOptions = map.options.layerOptions = {
            maxZoom: maxZoom,
            maxNativeZoom: mapData.maxZoom,
            extents: [
                {
                    height: mapData.heightRange || [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
                    bounds: [mapData.bounds],
                }
            ],
            type: 'map-layer',
        };
        let tileLayer = false;
        const baseLayers = [];
        const tileSize = mapData.tileSize || 256;
        if (mapData.tilePath) {
            tileLayer = L.tileLayer(mapData.tilePath || `https://assets.tarkov.dev/maps/${mapData.normalizedName}/{z}/{x}/{y}.png`, {
                tileSize,
                bounds,
                ...layerOptions,
            });
            baseLayers.push(tileLayer);
        }

        let svgLayer = false;
        if (mapData.svgPath) {
            // if (process.env.NODE_ENV === "development") {
            //     mapData.svgPath = mapData.svgPath.replace("assets.tarkov.dev/maps/svg", "raw.githubusercontent.com/the-hideout/tarkov-dev-src-maps/main/interactive");
            // }
            //baseLayer = L.imageOverlay(mapData.svgPath, bounds, layerOptions);
            const svgBounds = mapData.svgBounds ? getBounds(mapData.svgBounds) : bounds;
            svgLayer = L.imageOverlay(mapData.svgPath, svgBounds, layerOptions);
            baseLayers.push(svgLayer);
        }

        // only add selector if there are multiple
        if (tileLayer && svgLayer) {
            layerControl.addBaseLayer(tileLayer, tMaps('Satellite'));
            layerControl.addBaseLayer(svgLayer, tMaps('Abstract'));
        }

        for (const baseLayer of baseLayers) {
            if (mapData.layers?.length === 0) {
                break;
            }

            let selectedLayer = '';
            baseLayer.on('add', () => {
                const svgParent = baseLayer._url.endsWith('.svg');
                if (tileLayer && svgLayer) {
                    const selectedStyle = svgParent ? 'svg' : 'tile';
                    if (mapSettingsRef.current.style !== selectedStyle) {
                        mapSettingsRef.current.style = selectedStyle;
                        updateSavedMapSettings();
                    }
                }
                const existingLayers = Object.values(layerControl._layers).filter(l => l.layer.options.type === 'map-layer' && !baseLayers.includes(l.layer)).map(l => l.layer);
                for (const existingLayer of existingLayers) {
                    layerControl.removeLayer(existingLayer);
                    if (map.hasLayer(existingLayer)) {
                        map.removeLayer(existingLayer);
                        selectedLayer = existingLayer.options.name;
                    }
                }
                if (!mapData.layers) {
                    return;
                }
                for (const layer of mapData.layers) {
                    let heightLayer;
    
                    const layerOptions = {
                        name: layer.name,
                        extents: layer.extents || baseLayer.options?.extents,
                        type: 'map-layer',
                        overlay: Boolean(layer.extents),
                    };
                    
                    let usedStyle = svgParent ? 'svg' : 'tile';
                    if (!layer.svgPath) {
                        usedStyle = 'tile';
                    }
                    if (!layer.tilePath) {
                        usedStyle = 'svg';
                    }
                    if (!layer.svgPath && !layer.tilePath) {
                        continue;
                    }
                    if (usedStyle === 'svg') {
                        // if (process.env.NODE_ENV === "development") {
                        //     layer.svgPath = layer.svgPath.replace("assets.tarkov.dev/maps/svg", "raw.githubusercontent.com/the-hideout/tarkov-dev-src-maps/main/interactive");
                        // }
                        heightLayer = L.imageOverlay(layer.svgPath, bounds, layerOptions);
                    }
                    else if (usedStyle === 'tile') {
                        heightLayer = L.tileLayer(layer.tilePath, {
                            tileSize,
                            bounds,
                            ...layerOptions,
                        });
                    }
    
                    heightLayer.on('add', () => {
                        if (layer.extents) {
                            for (const marker of Object.values(map._layers)) {
                                checkMarkerForActiveLayers(marker);
                            }
                        }
                        // mapLayer._image means svg
                        if (baseLayer._image && !layer.show) {
                            baseLayer._image.classList.add('off-level');
                        } else if (baseLayer._container && !layer.show) {
                            baseLayer._container.classList.add('off-level');
                        }
                    });
                    heightLayer.on('remove', () => {
                        const heightLayer = Object.values(map._layers).findLast(l => l.options?.extents);
                        if (heightLayer) {
                            for (const marker of Object.values(map._layers)) {
                                checkMarkerForActiveLayers(marker);
                            }
                            const layers = Object.values(map._layers).filter(l => l.options.type === 'map-layer');
                            if (layers.length !== 1) {
                                return;
                            }
                            if (baseLayer._image) {
                                baseLayer._image.classList.remove('off-level');
                            } else if (baseLayer._container) {
                                baseLayer._container.classList.remove('off-level');
                            }
                        }
                    });

                    if (selectedLayer === layer.name) {
                        heightLayer.addTo(map);
                    } else if (!selectedLayer && layer.show) {
                        heightLayer.addTo(map);
                    }

                    layerControl.addOverlay(heightLayer, tMaps(layer.name), {groupName: tMaps('Levels')});
                }
            });
        }

        let baseLayer = svgLayer ? svgLayer : tileLayer;
        if (baseLayer === svgLayer && tileLayer && mapSettingsRef.current.style === 'tile') {
            baseLayer = tileLayer;
        }

        baseLayer.addTo(map);

        layerControl.removeGroupFromMap('Landmarks');

        markerBoundsRef.current = {
            'TL': {x:Number.MAX_SAFE_INTEGER, z:Number.MIN_SAFE_INTEGER},
            'BR': {x:Number.MIN_SAFE_INTEGER, z:Number.MAX_SAFE_INTEGER},
        };

        // Add labels
        if (mapData.labels?.length > 0) {
            const labelsGroup = L.layerGroup();
            const mainLayerVerticalMidpoint = ((layerOptions.extents[0].height[1] - layerOptions.extents[0].height[0]) / 2) + layerOptions.extents[0].height[0];
            for (const label of mapData.labels) {
                let positionY = mainLayerVerticalMidpoint;
                if (label.position.length > 2) {
                    // if a position is expressly provided, use it
                    positionY = label.position[2];
                } else if (typeof label.top !== 'undefined' && typeof label.bottom !== 'undefined') {
                    // calculate position as midpoint between top and bottom
                    positionY = ((label.top - label.bottom) / 2) + label.bottom;
                }
                const fontSize = label.size ? label.size : 100;
                const rotation = label.rotation ? label.rotation : 0;
                const labelMarker = L.marker(pos({x: label.position[0], z: label.position[1]}), {
                    icon: L.divIcon({
                        html: `<div class="label" style="font-size: ${fontSize}%; transform: translate3d(-50%, -50%, 0) rotate(${rotation}deg)">${tMaps(label.text)}</div>`,
                        className: 'map-area-label',
                        //layers: baseLayers,
                    }),
                    interactive: false,
                    zIndexOffset: -100000,
                    position: {
                        x: label.position[0],
                        y: positionY,
                        z: label.position[1],
                    },
                    top: label.top ?? 1000,
                    bottom: label.bottom ?? -1000,
                    group: 'place-names',
                });
                labelMarker.position = labelMarker.options.position;
                labelMarker.on('add', checkMarkerForActiveLayers);
                labelMarker.addTo(labelsGroup);
                checkMarkerBounds(label.position, markerBoundsRef.current);
            }
            addLayer(labelsGroup, 'place-names', 'Landmarks');
        }

        // Add static items 
        if (showStaticMarkers) {
            for (const category in staticMapData[mapData.normalizedName]) {
                const markerLayer = L.layerGroup();

                const items = staticMapData[mapData.normalizedName][category];
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

                    checkMarkerBounds(item.position, markerBoundsRef.current);
                }

                if (items.length > 0) {
                    var section;
                    if (category.startsWith('extract')) {
                        section = tMaps('Extracts');
                    }
                    else if (category.startsWith('spawn')) {
                        section = tMaps('Spawns');
                    }
                    else {
                        section = tMaps('Lootable Items');
                    }
                    markerLayer.addTo(map);
                    addLayer(markerLayer, category, section);
                    // layerControl.addOverlay(markerLayer, `<img src='${process.env.PUBLIC_URL}/maps/interactive/${category}.png' class='control-item-image' /> ${categories[category] || category}`, section);
                }
            }
        }

        if (showTestMarkers) {
            const positionLayer = L.layerGroup();
            const rotation = 45;
            const image = 'player-position.png';
            const playerIcon = L.divIcon({
                //iconUrl: `${process.env.PUBLIC_URL}/maps/interactive/player-position.png`,
                className: 'marker',
                html: `<img src="${process.env.PUBLIC_URL}/maps/interactive/${image}" style="width: 24px; height: 24px; rotate: ${rotation}deg;"/>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12],
                popupAnchor: [0, -12],
                //className: layerIncludesMarker(heightLayer, item) ? '' : 'off-level',
            });

            const positionMarker = L.marker([0,0], {icon: playerIcon, position: {x: 0, y: 0, z: 0}}).addTo(positionLayer);
            const closeButton = L.DomUtil.create('a');
            closeButton.innerHTML = tMaps('Clear');
            closeButton.addEventListener('click', () => {
                positionLayer.remove(positionMarker);
            });
            positionMarker.bindPopup(L.popup().setContent(closeButton));
            positionLayer.addTo(map);
            layerControl.addOverlay(positionLayer, tMaps('Player'), tMaps('Misc'));
        }

        //map.fitWorld({maxZoom: 0, animate: false});
        //map.setView(L.latLngBounds(bounds).getCenter(), 2, {animate: false});
        map.fitBounds(L.latLngBounds(bounds));
    }, [currentMap, tMaps, updateSavedMapSettings, addLayer]);

    // load markers from API maps data
    useEffect(() => {
        if (!mapData || mapData.projection !== 'interactive') {
            return;
        }
        const map = mapRef.current;
        if (!map.options.baseData) {
            return;
        }
        //console.log('loading api map data', mapData.normalizedName);

        map.raidInfoControl.options.map = mapData;
        map.raidInfoControl.refreshMapData();

        const layerControl = map.layerControl;

        const markerBounds = markerBoundsRef.current;

        // remove old markers
        const groupIds = [
            'Extracts',
            'Hazards',
            'Lootable Items',
            'Spawns',
        ];
        for (const groupId of groupIds) {
            layerControl.removeGroupFromMap(groupId);
        }
        const layerIds = [
            'stationarygun',
            'switch',
        ];
        for (const layerId of layerIds) {
            map.layerControl.removeLayerFromMap(layerId);
        }

        // Add spawns
        if (mapData.spawns.length > 0) {
            const spawnLayers = {
                'pmc': L.layerGroup(),
                'scav': L.layerGroup(),
                'sniper_scav': L.layerGroup(),
                'boss': L.layerGroup(),
                'cultist-priest': L.layerGroup(),
                'rogue': L.layerGroup(),
                'bloodhound': L.layerGroup(),
            }
            for (const spawn of mapData.spawns) {
                if (!positionIsInBounds(spawn.position)) {
                    continue;
                }
                let spawnType = '';
                let bosses = [];

                if (spawn.categories.includes('boss')) {
                    bosses = mapData.bosses.filter(boss => boss.spawnLocations.some(sl => sl.spawnKey === spawn.zoneName));
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
                } else if (spawn.categories.includes('sniper')) {
                    spawnType = 'sniper_scav';
                } else if (spawn.sides.includes('scav')) {
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
                addElevation(spawn, popupContent);

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
                    addLayer(spawnLayers[key], `spawn_${key}`, 'Spawns');
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
                const faction = extract.faction ?? 'shared';
                if (!positionIsInBounds(extract.position)) {
                    //continue;
                }
                const colorMap = {
                    scav: '#ff7800',
                    pmc: '#00e599',
                    shared: '#00e4e5',
                }
                const rect = L.polygon(outlineToPoly(extract.outline), {color: colorMap[faction], weight: 1, className: 'not-shown'});
                const extractIcon = L.divIcon({
                    className: 'extract-icon',
                    html: `<img src="${process.env.PUBLIC_URL}/maps/interactive/extract_${faction}.png"/><span class="extract-name ${faction}">${extract.name}</span>`,
                    iconAnchor: [12, 12]
                });
                const extractMarker = L.marker(pos(extract.position), {
                    icon: extractIcon,
                    title: extract.name,
                    zIndexOffset: zIndexOffsets[faction],
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
                    textElement.textContent = `${tMaps('Activated by')}:`;
                    popup.appendChild(textElement);
                    for (const sw of extract.switches) {
                        const linkElement = getPoiLinkElement(sw.id, 'switch');
                        const nameElement = L.DomUtil.create('span');
                        nameElement.innerHTML = `<strong>${sw.name}</strong>`;
                        linkElement.append(nameElement);
                        popup.appendChild(linkElement);
                    }
                    addElevation(extract, popup);
                    extractMarker.bindPopup(L.popup().setContent(popup));
                } else if (showElevation) {
                    const popup = L.DomUtil.create('div');
                    addElevation(extract, popup);
                    extractMarker.bindPopup(L.popup().setContent(popup));
                }
                extractMarker.on('add', checkMarkerForActiveLayers);
                L.layerGroup([rect, extractMarker]).addTo(extractLayers[faction]);

                checkMarkerBounds(extract.position, markerBounds);
            }
            if (mapData.transits.length > 0) {
                extractLayers.transit = L.layerGroup();

                for (const transit of mapData.transits) {
                    if (!positionIsInBounds(transit.position)) {
                        //continue;
                    }
                    const rect = L.polygon(outlineToPoly(transit.outline), {color: '#e53500', weight: 1, className: 'not-shown'});
                    const transitIcon = L.divIcon({
                        className: 'extract-icon',
                        html: `<img src="${process.env.PUBLIC_URL}/maps/interactive/extract_transit.png"/><span class="extract-name transit">${transit.description}</span>`,
                        iconAnchor: [12, 12]
                    });
                    const transitMarker = L.marker(pos(transit.position), {
                        icon: transitIcon,
                        title: transit.description,
                        zIndexOffset: zIndexOffsets.pmc,
                        position: transit.position,
                        top: transit.top,
                        bottom: transit.bottom,
                        outline: rect,
                        id: transit.id,
                    });
                    transitMarker.on('mouseover', mouseHoverOutline);
                    transitMarker.on('mouseout', mouseHoverOutline);
                    transitMarker.on('click', toggleForceOutline);
                    if (showElevation) {
                        const popup = L.DomUtil.create('div');
                        addElevation(transit, popup);
                        transitMarker.bindPopup(L.popup().setContent(popup));
                    }
                    transitMarker.on('add', checkMarkerForActiveLayers);
                    L.layerGroup([rect, transitMarker]).addTo(extractLayers.transit);
    
                    checkMarkerBounds(transit.position, markerBounds);
                }
            }
            for (const key in extractLayers) {
                if (Object.keys(extractLayers[key]._layers).length > 0) {
                    addLayer(extractLayers[key], `extract_${key}`, 'Extracts');
                }
            }
        }

        //add loot containers
        if (mapData.lootContainers.length > 0) {
            const containerLayers = {};
            const containerNames = {};
            for (const containerPosition of mapData.lootContainers) {
                if (!positionIsInBounds(containerPosition.position)) {
                    continue;
                }
                const containerIcon = L.icon({
                    iconUrl: `${process.env.PUBLIC_URL}/maps/interactive/${images[`container_${containerPosition.lootContainer.normalizedName}`]}.png`,
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

                const popup = L.DomUtil.create('div');
                const popupDiv = L.DomUtil.create('div', undefined, popup);
                popupDiv.textContent = containerPosition.lootContainer.name;
                addElevation(containerPosition, popup);
                containerMarker.bindPopup(L.popup().setContent(popup));
                
                containerMarker.on('add', checkMarkerForActiveLayers);
                containerMarker.on('click', activateMarkerLayer);
                containerMarker.addTo(containerLayers[containerPosition.lootContainer.normalizedName]);
                containerNames[containerPosition.lootContainer.normalizedName] = containerPosition.lootContainer.name;
            }
            for (const key in containerLayers) {
                if (Object.keys(containerLayers[key]._layers).length > 0) {
                    addLayer(containerLayers[key], `container_${key}`, 'Lootable Items', containerNames[key]);
                }
            }
        }

        //add switches 
        if (mapData.switches.length > 0) {
            const switches = L.layerGroup();
            for (const sw of mapData.switches) {
                if (!positionIsInBounds(sw.position)) {
                    continue;
                }
                const switchIcon = L.icon({
                    iconUrl: `${process.env.PUBLIC_URL}/maps/interactive/switch.png`,
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
                    textElement.textContent = `${tMaps('Activated by')}:`;
                    popup.appendChild(textElement);
                    const linkElement = getPoiLinkElement(sw.activatedBy.id, 'switch');
                    const nameElement = L.DomUtil.create('span');
                    nameElement.innerHTML = `<strong>${sw.activatedBy.name}</strong>`;
                    linkElement.append(nameElement);
                    popup.appendChild(linkElement);
                }
                if (sw.activates.length > 0) {
                    const textElement = L.DomUtil.create('div');
                    textElement.textContent = `${tMaps('Activates')}:`;
                    popup.append(textElement);
                }
                for (const switchOperation of sw.activates) {
                    if (switchOperation.target.__typename === 'MapSwitch') {
                        const linkElement = getPoiLinkElement(switchOperation.target.id, 'switch');
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
                addElevation(sw, popup);
                if (popup.childNodes.length > 0) {
                    switchMarker.bindPopup(L.popup().setContent(popup));
                }
                switchMarker.on('add', checkMarkerForActiveLayers);
                switchMarker.on('click', activateMarkerLayer);
                switchMarker.addTo(switches);

                checkMarkerBounds(sw.position, markerBoundsRef.current);
            }
            if (Object.keys(switches._layers).length > 0) {
                addLayer(switches, 'switch', 'Usable');
            }
        }

        // add stationary weapons
        if (mapData.stationaryWeapons.length > 0) {
            const stationaryWeapons = L.layerGroup();
            for (const weaponPosition of mapData.stationaryWeapons) {
                if (!positionIsInBounds(weaponPosition.position)) {
                    continue;
                }
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
                if (showElevation) {
                    const popup = L.DomUtil.create('div');
                    addElevation(weaponPosition, popup);
                    weaponMarker.bindPopup(L.popup().setContent(popup));
                }
                weaponMarker.on('add', checkMarkerForActiveLayers);
                weaponMarker.on('click', activateMarkerLayer);
                weaponMarker.addTo(stationaryWeapons);
            }
            addLayer(stationaryWeapons, 'stationarygun', 'Usable');
        }

        //add hazards
        if (mapData.hazards.length > 0 || mapData.artillery?.zones?.length) {
            const hazardLayers = {};
            const hazardNames = {};
            for (const hazard of mapData.hazards) {
                if (!positionIsInBounds(hazard.position)) {
                    continue;
                }
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
                const popup = L.DomUtil.create('div');
                const hazardText = L.DomUtil.create('div', undefined, popup);
                hazardText.textContent = hazard.name;
                addElevation(hazard, popup);
                hazardMarker.bindPopup(L.popup().setContent(popup));

                hazardMarker.on('mouseover', mouseHoverOutline);
                hazardMarker.on('mouseout', mouseHoverOutline);
                hazardMarker.on('click', toggleForceOutline);
                hazardMarker.on('add', checkMarkerForActiveLayers);
                if (!hazardLayers[hazard.hazardType]) {
                    hazardLayers[hazard.hazardType] = L.layerGroup();
                    hazardNames[hazard.hazardType] = hazard.name;
                }
                L.layerGroup([rect, hazardMarker]).addTo(hazardLayers[hazard.hazardType]);

                checkMarkerBounds(hazard.position, markerBounds);
            }
            
            if (mapData.artillery?.zones?.length > 0) {
                for (const hazard of mapData.artillery.zones) {
                    if (!positionIsInBounds(hazard.position)) {
                        continue;
                    }
                    const rect = L.polygon(outlineToPoly(hazard.outline), {color: '#ff0000', weight: 1, className: 'not-shown'});
                    const hazardIcon = L.icon({
                        iconUrl: `${process.env.PUBLIC_URL}/maps/interactive/hazard_mortar.png`,
                        iconSize: [24, 24],
                        popupAnchor: [0, -12],
                    });

                    const artyName = t('Mortar');
                    
                    const hazardMarker = L.marker(pos(hazard.position), {
                        icon: hazardIcon, 
                        title: artyName, 
                        //zIndexOffset: -100,
                        position: hazard.position,
                        top: hazard.top,
                        bottom: hazard.bottom,
                        outline: rect,
                    });
                    const popup = L.DomUtil.create('div');
                    const hazardText = L.DomUtil.create('div', undefined, popup);
                    hazardText.textContent = t('Mortar');
                    addElevation(hazard, popup);
                    hazardMarker.bindPopup(L.popup().setContent(popup));
    
                    hazardMarker.on('mouseover', mouseHoverOutline);
                    hazardMarker.on('mouseout', mouseHoverOutline);
                    hazardMarker.on('click', toggleForceOutline);
                    hazardMarker.on('add', checkMarkerForActiveLayers);
                    if (!hazardLayers.mortar) {
                        hazardLayers.mortar = L.layerGroup();
                        hazardNames.mortar = artyName;
                    }
                    L.layerGroup([rect, hazardMarker]).addTo(hazardLayers.mortar);
    
                    checkMarkerBounds(hazard.position, markerBounds);
                }
            }
            for (const key in hazardLayers) {
                if (Object.keys(hazardLayers[key]._layers).length > 0) {
                    addLayer(hazardLayers[key], `hazard_${key}`, 'Hazards', hazardNames[key]);
                }
            }
        }

        if (showMarkersBounds) {
            console.log(`Markers "bounds": [[${markerBounds.BR.x}, ${markerBounds.BR.z}], [${markerBounds.TL.x}, ${markerBounds.TL.z}]] (already rotated, copy/paste to maps.json)`);

            L.rectangle([pos(markerBounds.TL), pos(markerBounds.BR)], {color: '#ff000055', weight: 1}).addTo(map);
            L.rectangle(getBounds(mapData.bounds), {color: '#00ff0055', weight: 1}).addTo(map);
        }

        // Set default zoom level
        // map.fitBounds(bounds);
        // map.fitWorld({maxZoom: Math.max(mapData.maxZoom-3, mapData.minZoom)});

        // maxBounds are bigger than the map and the map center is not in 0,0 so we need to move the view to real center
        // console.log("Center:", L.latLngBounds(bounds).getCenter(true));
        //map.setView(L.latLngBounds(bounds).getCenter(true), undefined, {animate: false});
    }, [mapData, t, updateSavedMapSettings, addLayer, categories, tMaps, getPoiLinkElement]);

    // for markers requiring quests
    useEffect(() => {
        if (!mapData || mapData.projection !== 'interactive') {
            return;
        }
        const map = mapRef.current;
        if (!map.options.baseData) {
            return;
        }
        //console.log('loading quest markers');
        // remove old markers
        const groupIds = [
            'Tasks',
        ];
        for (const groupId of groupIds) {
            map.layerControl.removeGroupFromMap(groupId);
        }
        //add quest markers
        const questItems = L.layerGroup();
        const questObjectives = L.layerGroup();
        for (const quest of quests) {
            for (const obj of quest.objectives) {
                if (settings.useTarkovTracker && mapSettingsRef.current.showOnlyActiveTasks && obj.complete) {
                    continue;
                }
                if (obj.possibleLocations) {
                    for (const loc of obj.possibleLocations) {
                        if (!loc.map?.id) {
                            continue;
                        }
                        if (loc.map.id !== mapData.id) {
                            continue;
                        }
                        for (const position of loc.positions) {
                            if (!positionIsInBounds(position)) {
                                continue;
                            }
                            const questItemIcon = L.icon({
                                iconUrl: `${process.env.PUBLIC_URL}/maps/interactive/quest_item.png`,
                                iconSize: [24, 24],
                                popupAnchor: [0, -12],
                                className: quest.active ? 'active-quest-marker' : 'inactive-quest-marker',
                            });
                            const questItemMarker = L.marker(pos(position), {
                                icon: questItemIcon,
                                position: position,
                                title: obj.questItem.name,
                                id: obj.questItem.id,
                                questId: quest.id,
                            });
                            const popupContent = L.DomUtil.create('div');
                            const questLink = getReactLink(`/task/${quest.normalizedName}`, quest.name);
                            popupContent.append(questLink);
                            const questItem = L.DomUtil.create('div', 'popup-item', popupContent);
                            const questItemImage = L.DomUtil.create('img', 'popup-item', questItem);
                            questItemImage.setAttribute('src', `${obj.questItem.baseImageLink}`);
                            questItem.append(`${obj.questItem.name}`);
                            addElevation({position}, popupContent);
                            questItemMarker.bindPopup(L.popup().setContent(popupContent));
                            questItemMarker.on('add', checkMarkerForActiveLayers);
                            questItemMarker.on('click', activateMarkerLayer);
                            questItemMarker.addTo(questItems);

                            checkMarkerBounds(position, markerBoundsRef.current);
                        }
                    }
                }
                if (obj.zones) {
                    for (const zone of obj.zones) {
                        if (!zone.map?.id || zone.map.id !== mapData.id) {
                            continue;
                        }
                        if (!positionIsInBounds(zone.position)) {
                            continue;
                        }
                        const rect = L.polygon(outlineToPoly(zone.outline), {color: '#e5e200', weight: 1, className: 'not-shown'});
                        const zoneIcon = L.icon({
                            iconUrl: `${process.env.PUBLIC_URL}/maps/interactive/quest_objective.png`,
                            iconSize: [24, 24],
                            popupAnchor: [0, -12],
                            className: quest.active ? 'active-quest-marker' : 'inactive-quest-marker',
                        });
                        
                        const zoneMarker = L.marker(pos(zone.position), {
                            icon: zoneIcon,
                            title: obj.description,
                            position: zone.position,
                            top: zone.top,
                            bottom: zone.bottom,
                            outline: rect,
                            id: zone.id,
                            questId: quest.id,
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
                        addElevation(zone, popupContent);
                        zoneMarker.bindPopup(L.popup().setContent(popupContent));
                        zoneMarker.on('add', checkMarkerForActiveLayers);
                        L.layerGroup([rect, zoneMarker]).addTo(questObjectives);
                    }
                }
            }
        }
        if (Object.keys(questItems._layers).length > 0) {
            addLayer(questItems, 'quest_item', 'Tasks');
        }
        if (Object.keys(questObjectives._layers).length > 0) {
            addLayer(questObjectives, 'quest_objective', 'Tasks');
        }
        
        for (const id of focusItem.current) {
            if (focusOnPoi(id)) {
                focusItem.current = [];
                break;
            }
        }
    }, [mapData, quests, settings, addLayer]);

    // for markers requiring game items
    useEffect(() => {
        if (!mapData || mapData.projection !== 'interactive') {
            return;
        }
        const map = mapRef.current;
        if (!map.options.baseData) {
            return;
        }
        // remove old markers
        const groupIds = [
            'Loose Loot',
        ];
        for (const groupId of groupIds) {
            map.layerControl.removeGroupFromMap(groupId);
        }
        const layerIds = [
            'lock',
        ];
        for (const layerId of layerIds) {
            map.layerControl.removeLayerFromMap(layerId);
        }

        //add locks
        if (mapData.locks.length > 0) {
            const locks = L.layerGroup();
            for (const lock of mapData.locks) {const key = items.find(i => i.id === lock.key.id);
                if (!key) {
                    continue;
                }
                
                if (!positionIsInBounds(lock.position)) {
                    continue;
                }

                checkMarkerBounds(lock.position, markerBoundsRef.current);
                const lockIcon = L.icon({
                    iconUrl: `${process.env.PUBLIC_URL}/maps/interactive/lock.png`,
                    iconSize: [24, 24],
                    popupAnchor: [0, -12],
                });
                var lockTypeText;
                if (lock.lockType === 'door') {
                    lockTypeText = tMaps('Door');
                }
                else if (lock.lockType === 'container') {
                    lockTypeText = tMaps('Container');
                }
                else if (lock.lockType === 'trunk') {
                    lockTypeText = tMaps('Car Door or Trunk');
                }
                else {
                    lockTypeText = tMaps('Lock');
                }
                
                const lockMarker = L.marker(pos(lock.position), {
                    icon: lockIcon,
                    position: lock.position,
                    title: `${tMaps('Lock')}: ${key.name}`,
                    id: key.id,
                });

                const popupContent = L.DomUtil.create('div');
                const lockTypeNode = L.DomUtil.create('div', undefined, popupContent);
                lockTypeNode.innerHTML = `<strong>${lockTypeText}</strong>`;
                if (lock.needsPower) {
                    const powerNode = L.DomUtil.create('div', undefined, popupContent);
                    powerNode.innerHTML = `<em>${tMaps('Needs power')}</em>`;
                }
                const lockImage = L.DomUtil.create('img', 'popup-item');
                lockImage.setAttribute('src', `${key.baseImageLink}`);
                const lockLink = getReactLink(`/item/${key.normalizedName}`, lockImage);
                lockLink.append(`${key.name}`);
                popupContent.append(lockLink);
                addElevation(lock, popupContent);

                lockMarker.bindPopup(L.popup().setContent(popupContent));
                lockMarker.on('add', checkMarkerForActiveLayers);
                lockMarker.on('click', activateMarkerLayer);
                lockMarker.addTo(locks);
                
            }
            if (Object.keys(locks._layers).length > 0) {
                addLayer(locks, 'lock', 'Usable');
            }
        }

        //add loose loot
        if (mapData.lootLoose.length > 0) {
            const looseLootLayer = L.layerGroup();
            for (const looseLoot of mapData.lootLoose) {
                if (!positionIsInBounds(looseLoot.position)) {
                    continue;
                }
                const lootItems = items.filter(item => looseLoot.items.some(lootItem => item.id === lootItem.id));
                if (lootItems.length === 0) {
                    continue;
                }
                let iconSize = [24, 24];
                let iconUrl = `${process.env.PUBLIC_URL}/maps/interactive/${images.loose_loot}.png`;
                let markerTitle = t('Loose Loot');
                let className = '';
                if (lootItems.length === 1) {
                    const item = lootItems[0];
                    iconUrl = item.baseImageLink;
                    markerTitle = item.name;
                    className = 'loot-outline';
                    const pixelWidth = (item.width * 63) + 1;
                    const pixelHeight = (item.height * 63) + 1;
                    if (item.width > item.height) {
                        const scale = 24 / pixelWidth;
                        iconSize = [24, pixelHeight * scale];
                    } else {
                        const scale = 24 / pixelHeight;
                        iconSize = [pixelWidth * scale, 24];
                    }
                }
                const lootIcon = new L.Icon({
                    iconUrl,
                    iconSize,
                    popupAnchor: [0, -12],
                    className,
                });
                
                const lootMarker = L.marker(pos(looseLoot.position), {
                    icon: lootIcon, 
                    title: markerTitle,
                    position: looseLoot.position,
                    items: lootItems.map((item) => item.name),
                });

                const popup = L.DomUtil.create('div');
                const popupContent = L.DomUtil.create('div', undefined, popup);
                //L.DomUtil.create('div', undefined, popupContent).textContent = JSON.stringify(looseLoot.position);
                for (const lootItem of lootItems) {
                    //const lootContent = L.DomUtil.create('div', undefined, popupContent);
                    const lootImage = L.DomUtil.create('img', 'popup-item');
                    lootImage.setAttribute('src', `${lootItem.baseImageLink}`);
                    const lootLink = getReactLink(`/item/${lootItem.normalizedName}`, lootImage);
                    lootLink.setAttribute('title', lootItem.name);
                    if (className) {
                        lootLink.append(`${lootItem.name}`);
                    }
                    popupContent.append(lootLink);
                }
                addElevation(looseLoot, popup);
                lootMarker.bindPopup(L.popup().setContent(popup));
                
                lootMarker.on('add', checkMarkerForActiveLayers);
                lootMarker.on('click', activateMarkerLayer);
                lootMarker.addTo(looseLootLayer);
            }
            addLayer(looseLootLayer, 'loose_loot', 'Loose Loot', t('Loose Loot'));
        }
        
        for (const id of focusItem.current) {
            if (focusOnPoi(id)) {
                focusItem.current = [];
                break;
            }
        }
    }, [mapData, items, addLayer, t, tMaps, getPoiLinkElement]);

    useEffect(() => {
        if (!mapData || mapData.projection !== 'interactive') {
            return;
        }
        const map = mapRef.current;
        if (!map.options.baseData) {
            return;
        }
        //console.log('loading player position marker');
        
        map.layerControl.removeLayerFromMap('player_position');

        // Add player position
        if (playerPosition && (playerPosition.map === mapData.key || playerPosition.map === null)) {
            const positionLayer = L.layerGroup();
            let addRotation = mapData.coordinateRotation;
            if (addRotation === 90 || addRotation === 270) {
                addRotation += 180;
            }
            const rotation = (playerPosition.rotation ?? 0) + addRotation;
            const image = playerPosition.rotation !== undefined ? 'player-position.png' : 'player-position-no-rotation.png';
            const playerIcon = L.divIcon({
                //iconUrl: `${process.env.PUBLIC_URL}/maps/interactive/player-position.png`,
                className: 'marker',
                html: `<img src="${process.env.PUBLIC_URL}/maps/interactive/${image}" style="width: 24px; height: 24px; rotate: ${rotation}deg;"/>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12],
                popupAnchor: [0, -12],
                //className: layerIncludesMarker(heightLayer, item) ? '' : 'off-level',
            });
                  
            const positionMarker = L.marker(pos(playerPosition.position), {icon: playerIcon, position: playerPosition.position}).addTo(positionLayer);
            const closeButton = L.DomUtil.create('a');
            closeButton.innerHTML = tMaps('Clear');
            closeButton.addEventListener('click', () => {
                dispatch(setPlayerPosition(null));
            });
            positionMarker.bindPopup(L.popup().setContent(closeButton));
            positionMarker.on('add', checkMarkerForActiveLayers);
            positionMarker.on('click', activateMarkerLayer);
            positionLayer.addTo(mapRef.current);
            //layerControl.addOverlay(positionLayer, tMaps('Player'), tMaps('Misc'));
            addLayer(positionLayer, 'player_position', 'Misc');
            activateMarkerLayer({target: positionMarker});
        }
    }, [mapData, playerPosition, addLayer, dispatch, tMaps]);
    
    if (!mapData) {
        return <ErrorPage />;
    }

    return [
        <SEO 
            title={`${t('Map of {{mapName}}', {mapName: mapData.displayText})} - ${t('Escape from Tarkov')} - ${t('Tarkov.dev')}`}
            description={mapData.description}
            image={`${window.location.origin}${process.env.PUBLIC_URL}${mapData.imageThumb}`}
            card='summary_large_image'
            key="seo-wrapper"
        />,
        <div className="display-wrapper" key="map-wrapper">
            {mapData.projection !== 'interactive' && ([    
            <Time
                key="raid-info"
                currentMap={currentMap}
                normalizedName={mapData.normalizedName}
                duration={mapData.duration}
                players={mapData.players}
                author={mapData.author}
                authorLink={mapData.authorLink}
            />,
            <TransformWrapper
                ref={ref}
                initialScale={1}
                centerOnInit={true}
                wheel={{
                    step: 0.1,
                }}
                key="map-holder"
            >
                <TransformComponent>
                    <div className="map-image-wrapper">
                        <img
                            alt={t('Map of {{mapName}}', {mapName: mapData.displayText})}
                            loading="lazy"
                            className="map-image"
                            title={t('Map of {{mapName}}', {mapName: mapData.displayText})}
                            src={`${process.env.PUBLIC_URL}${mapData.image}`}
                        />
                    </div>
                </TransformComponent>
            </TransformWrapper>])}
            <div id="leaflet-map" ref={onMapContainerRefChange} className={'leaflet-map-container'+savedMapSettings.showOnlyActiveTasks ? ' only-active-quest-markers' : ''} style={{display: mapData.projection === 'interactive' ? '' : 'none'}}/>
        </div>,
    ];
}
export default Map;
