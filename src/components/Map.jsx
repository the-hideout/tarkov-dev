import { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    TransformWrapper,
    TransformComponent,
} from 'react-zoom-pan-pinch';
import { MapContainer, LayersControl } from 'react-leaflet'
import L from 'leaflet';

import { useMapImages } from '../features/maps';

import Time from './Time';
import SEO from './SEO';

import ErrorPage from './error-page';

const showTestMarkers = true;

const testMarkers = {
    customs: [
        {
            name: '0, 0',
            coordinates: [0, 0]
        },
        {
            name: 'Flash drive with fake info',
            coordinates: [-91.521, 4.346]
        },
        {
            name: 'Bronze pocket watch',
            coordinates: [102.2964, -5.9064]
        },
        {
            name: 'Secure Folder 0022',
            coordinates: [-202.8806, -102.4012]
        },
        {
            name: 'Secure Folder 0031',
            coordinates: [204.073, 12.3975]
        },
        {
            name: 'Secure Folder 0048',
            coordinates: [367.6828, -50.5712]
        },
        {
            name: 'Golden Zibbo',
            coordinates: [180.8072, 150.0781]
        },
        {
            name: 'Secure Folder 0013',
            coordinates: [498.5496, -141.5012]
        },
        {
            name: 'Carbon case',
            coordinates: [239.183, 160.595]
        },
        {
            name: 'Sliderkey Secure Flash Drive',
            coordinates: [194.2243, 171.0656]
        },
        {
            name: 'Package of graphics cards',
            coordinates: [-204.388, -98.63]
        }
    ],
};

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

    const [mapRef, setMapRef] = useState(null);
    const onMapRefChange = useCallback(node => {
        setMapRef(node);
    }, []);

    const [legend, setLegendRef] = useState(null);
    const onLegendRefChange = useCallback(node => {
        setLegendRef(node);
    }, []);

    useEffect(() => {
        ref?.current?.resetTransform();
    }, [currentMap]);

    let allMaps = useMapImages();

    const mapData = useMemo(() => {
        return allMaps[currentMap];
    }, [allMaps, currentMap]);

    const transformation = useMemo(() => {
        if (!mapData || !mapData.transform) {
            return new L.Transformation(1, 0, 1, 0);
        }
        let scaleX = mapData.transform[0];
        let scaleY = mapData.transform[2];
        let marginX = mapData.transform[1];
        let marginY = mapData.transform[3];
        if (mapData.coordinateRotation === 90) {
            //factory
        }
        if (mapData.coordinateRotation === 180) {
            scaleX = scaleX * -1;
            scaleY = scaleY * -1;
        }
        if (mapData.coordinateRotation === 270) {
            //labs
        }
        return new L.Transformation(scaleX, marginX, scaleY, marginY);
    }, [mapData]);

    useEffect(() => {
        if (!mapRef || !legend || !mapData || !mapData.tileSize) {
            return;
        }
        while (legend._layers.length > 0) {
            legend.removeLayer(legend._layers[0].layer)
        }
        mapRef.eachLayer(layer => layer?.remove());
        mapRef.setMinZoom(mapData.minZoom);
        mapRef.setMaxZoom(mapData.maxZoom);
        const baseLayer = L.tileLayer(mapData.mapPath || `https://assets.tarkov.dev/maps/${mapData.normalizedName}/{z}/{x}/{y}.png`, {tileSize: mapData.tileSize});
        baseLayer.addTo(mapRef);
        const markers = testMarkers[mapData.normalizedName];
        if (showTestMarkers && markers) {
            const markerLayer = L.layerGroup();
            for (const m of markers) {
                const point = transformation.transform(L.point(m.coordinates[0], m.coordinates[1]));
                L.marker([point.y, point.x])
                    .bindPopup(L.popup().setContent(m.name))
                    .addTo(markerLayer);
            }
            if (markers.length > 0) {
                markerLayer.addTo(mapRef);
                legend.addOverlay(markerLayer, t('Markers'));
            }
        }
        if (mapData.layers) {
            for (const layer of mapData.layers) {
                const tileLayer = L.tileLayer(layer.path, {tileSize: mapData.tileSize});
                tileLayer.addTo(mapRef);
                legend.addOverlay(tileLayer, t(layer.name));
            }
        } 
        const zeroPoint = transformation.transform(L.point(0, 0));
        mapRef.panTo([zeroPoint.y, zeroPoint.x])
    }, [mapData, mapRef, transformation, legend, t]);
    
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
        <div className="display-wrapper" key="map-wrapper" style={{height: '500px'}}>
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
            {mapData.projection === 'interactive' && (<MapContainer ref={onMapRefChange} center={[0, 0]} zoom={2} scrollWheelZoom={true} crs={L.CRS.Simple} style={{height: '500px', backgroundColor: 'transparent'}}>
                <LayersControl
                    ref={onLegendRefChange}
                    position="bottomleft"
                ></LayersControl>
            </MapContainer>)}
        </div>,
    ];
}
export default Map;
