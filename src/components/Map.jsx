import { useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    TransformWrapper,
    TransformComponent,
} from 'react-zoom-pan-pinch';
import L from 'leaflet';
import '../modules/leaflet-coordinates';
import 'leaflet.awesome-markers';
import 'leaflet-fullscreen/dist/Leaflet.fullscreen';

import { useMapImages } from '../features/maps';

import testMapData from '../data/maps_test.json';

import Time from './Time';
import SEO from './SEO';

import ErrorPage from './error-page';

import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.css';
import 'leaflet.coordinates/dist/Leaflet.Coordinates-0.1.5.css';
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css';

L.AwesomeMarkers.Icon.prototype.options.prefix = 'ion';

const showTestMarkers = true;

function getCRS(mapData) {
    let scaleX = 1;
    let scaleY = 1;
    let marginX = 0;
    let marginY = 0;
    if (mapData) {    
        if (mapData.transform) {
            scaleX = mapData.transform[0];
            scaleY = mapData.transform[0] * -1;
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
    const {lng: x, lat: y} = latLng;
    if (!rotation) {
        return L.latLng(y, x);
    }
    const angleInRadians = (rotation * Math.PI) / 180;
    const cosAngle = Math.cos(angleInRadians);
    const sinAngle = Math.sin(angleInRadians);

    const rotatedX = x * cosAngle - y * sinAngle;
    const rotatedY = x * sinAngle + y * cosAngle;
    return L.latLng(rotatedY, rotatedX);
}

function pos(position) {
    return [position.z, position.x];
}

function getMaxBounds(mapData) {
    if (!mapData.bounds) {
        return undefined;
    }
    return [[mapData.bounds[0][1], mapData.bounds[0][0]], [mapData.bounds[1][1], mapData.bounds[1][0]]];
}

function Map() {
    let { currentMap } = useParams();

    const { t } = useTranslation();

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

    let allMaps = useMapImages();

    const mapData = useMemo(() => {
        return allMaps[currentMap];
    }, [allMaps, currentMap]);

    useEffect(() => {
        if (!mapData || !mapData.tileSize) {
            return;
        }
        if (mapRef.current?._leaflet_id) {
            mapRef.current.remove();
        }
        const maxBounds = getMaxBounds(mapData);
        const map = L.map('leaflet-map', {
            maxBounds: maxBounds,
            center: [0, 0],
            zoom: 2,
            scrollWheelZoom: true,
            crs: getCRS(mapData),
            attributionControl: false,
        });
        const legend = L.control.layers(null, null, {position: 'topleft'}).addTo(map);
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

        L.control.scale({position: 'bottomright'}).addTo(map);

        map.setMinZoom(mapData.minZoom);
        map.setMaxZoom(mapData.maxZoom);
        const baseLayer = L.tileLayer(mapData.mapPath || `https://assets.tarkov.dev/maps/${mapData.normalizedName}/{z}/{x}/{y}.png`, {
            tileSize: mapData.tileSize,
            bounds: maxBounds,
        });
        baseLayer.addTo(map);
        if (showTestMarkers && testMapData[mapData.normalizedName]?.markers) {
            const markers = testMapData[mapData.normalizedName].markers;
            const markerLayer = L.layerGroup();
            for (const m of markers) {
                const questMarker = L.AwesomeMarkers.icon({
                    icon: 'checkmark',
                    markerColor: 'blue',
                });
                L.marker(pos(m.position), {icon: questMarker})
                    .bindPopup(L.popup().setContent(`${m.name}<br>${JSON.stringify(m.position)}`))
                    .addTo(markerLayer);
            }
            if (markers.length > 0) {
                markerLayer.addTo(map);
                legend.addOverlay(markerLayer, t('Markers'));
            }
        }
        if (mapData.spawns.length > 0) {
            const spawnLayer = L.layerGroup();
            for (const spawn of mapData.spawns) {
                let bosses = [];
                let color = '#3aff33';
                if (!spawn.sides.includes('pmc') && spawn.sides.includes('scav')) {
                    color = '#ff3333';
                }
                if (spawn.categories.includes('boss')) {
                    bosses = mapData.bosses.filter(boss => boss.spawnLocations.some(sl => sl.spawnKey === spawn.zoneName));
                    if (bosses.length > 0) {
                        color = '#eb33ff';
                    }
                }
                if (spawn.sides.includes('all')) {
                    //color = '#ffa033';
                }
                const spawnMarker = L.circle(pos(spawn.position), {
                    radius: 5,
                    color,
                });
                const popupLines = [];
                if (spawn.categories.includes('boss')) {
                    popupLines.push(spawn.zoneName);
                    popupLines.push(bosses.map(boss => `<a href="/boss/${boss.normalizedName}">${boss.name}</a>`).join(', '))
                }
                popupLines.push(JSON.stringify(spawn.position));
                spawnMarker.bindPopup(L.popup().setContent(popupLines.join('<br>')));
                spawnMarker.addTo(spawnLayer);
            }
            spawnLayer.addTo(map);
            legend.addOverlay(spawnLayer, t('Spawns'));
        }
        if (mapData.layers) {
            for (const layer of mapData.layers) {
                const tileLayer = L.tileLayer(layer.path, {
                    tileSize: mapData.tileSize,
                    bounds: maxBounds,
                });
                legend.addOverlay(tileLayer, t(layer.name));
                if (layer.show) {
                    tileLayer.addTo(map);
                }
            }
        } 
        //const zeroPoint = L.point(0, 0);
        //map.panTo([zeroPoint.y, zeroPoint.x]);
        map.fitWorld({maxZoom: 2});
        mapRef.current = map;
    }, [mapData, mapRef, t]);
    
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
