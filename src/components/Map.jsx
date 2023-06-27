import { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    TransformWrapper,
    TransformComponent,
} from 'react-zoom-pan-pinch';
import { MapContainer } from 'react-leaflet'
import L from 'leaflet';

import { useMapImages } from '../features/maps';

import Time from './Time';
import SEO from './SEO';

import ErrorPage from './error-page';

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

    useEffect(() => {
        ref?.current?.resetTransform();
    }, [currentMap]);

    let allMaps = useMapImages();

    const mapData = useMemo(() => {
        return allMaps[currentMap];
    }, [allMaps, currentMap]);

    useEffect(() => {
        if (!mapRef || !mapData || !mapData.tileSize) {
            return;
        }
        mapRef?.eachLayer(layer => layer?.remove());
        mapRef.setMinZoom(mapData.minZoom);
        mapRef.setMaxZoom(mapData.maxZoom);
        L.tileLayer(`https://assets.tarkov.dev/maps/${mapData.normalizedName}/{z}/{x}/{y}.png`, {tileSize: mapData.tileSize}).addTo(mapRef);
        const markers = testMarkers[mapData.normalizedName];
        const transformation = new L.Transformation(mapData.transform[0], mapData.transform[1], mapData.transform[2], mapData.transform[3]);
        if (markers) {
            for (const m of markers) {
                const point = transformation.transform(L.point(m.coordinates[0], m.coordinates[1]));
                L.marker([point.y, point.x])
                    .bindPopup(L.popup().setContent(m.name))
                    .addTo(mapRef);
            }
        }
        const zeroPoint = transformation.transform(L.point(0, 0));
        mapRef.panTo([zeroPoint.y, zeroPoint.x])
    }, [mapData, mapRef]);
    
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
            {mapData.projection === 'interactive' && (<MapContainer ref={onMapRefChange} center={[0, 0]} zoom={2} scrollWheelZoom={true} crs={L.CRS.Simple} style={{height: '500px', backgroundColor: 'transparent'}}></MapContainer>)}
        </div>,
    ];
}
export default Map;
