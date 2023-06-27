import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    TransformWrapper,
    TransformComponent,
} from 'react-zoom-pan-pinch';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet';

import { useMapImages } from '../features/maps';

import Time from './Time';
import SEO from './SEO';

import ErrorPage from './error-page';

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

    useEffect(() => {
        ref?.current?.resetTransform();
    }, [currentMap]);

    let allMaps = useMapImages();

    if (!allMaps[currentMap]) {
        return <ErrorPage />;
    }
    const { displayText, author, authorLink, normalizedName, description, duration, players, image, imageThumb, projection, transform } = allMaps[currentMap];
    const markers = [
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
    ];
    let mapElement = <></>;
    if (projection !== 'interactive') {
        mapElement = <TransformWrapper
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
                        alt={`${displayText} ${t('Map')}`}
                        loading="lazy"
                        className="map-image"
                        title={`${displayText} ${t('Map')}`}
                        src={`${process.env.PUBLIC_URL}${image}`}
                    />
                </div>
            </TransformComponent>
        </TransformWrapper>
    } else {
        L.CRS.MySimple = L.extend({}, L.CRS.Simple, {
            transformation: new L.Transformation(transform[0], transform[1], transform[2], transform[3])
        });
        mapElement = <MapContainer center={[0, 0]} zoom={2} scrollWheelZoom={true} crs={L.CRS.MySimple} minZoom={2} maxZoom={5} style={{height: '500px', backgroundColor: 'transparent'}} boundsOptions={{padding: [50, 50]}}>
            <TileLayer
                url="https://assets.tarkov.dev/maps/customs/{z}/{x}/{y}.png"
                tileSize={allMaps[currentMap].tileSize}
            />
            {markers.map((marker, index) => {
                return <Marker position={[marker.coordinates[1], marker.coordinates[0]]} key={`marker-${index}`} color={'red'}>
                    <Popup>
                        {marker.name} {`[${marker.coordinates[0]}, ${marker.coordinates[1]}]`}
                    </Popup>
                </Marker>
            })}
        </MapContainer>
    }

    return [
        <SEO 
            title={`${displayText} - ${t('Escape from Tarkov')} - ${t('Tarkov.dev')}`}
            description={description}
            image={`${window.location.origin}${process.env.PUBLIC_URL}${imageThumb}`}
            card='summary_large_image'
            key="seo-wrapper"
        />,
        <div className="display-wrapper" key="map-wrapper" style={{height: '500px'}}>
            <Time
                currentMap={currentMap}
                normalizedName={normalizedName}
                duration={duration}
                players={players}
                author={author}
                authorLink={authorLink}
            />
            {mapElement}
        </div>,
    ];
}
export default Map;
