import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
    TransformWrapper,
    TransformComponent,
} from '@kokarn/react-zoom-pan-pinch';

import Time from './Time';
import SEO from './SEO';

import ErrorPage from './error-page';

import rawMapData from '../data/maps.json';

function Map() {
    let { currentMap } = useParams();

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

    let allMaps = {};

    for(const mapsGroup of rawMapData) {
        for(const map of mapsGroup.maps) {
            allMaps[map.key] = {
                ...map,
                normalizedName: mapsGroup.normalizedName,
                description: mapsGroup.description,
                duration: mapsGroup.duration,
                players: mapsGroup.players,
                image: `/maps/${map.key}.jpg`,
                imageThumb: `/maps/${map.key}_thumb.jpg`,
            }
        }
    }

    if (!allMaps[currentMap]) {
        return <ErrorPage />;
    }

    const { displayText, source, sourceLink, normalizedName, description, duration, players, image, imageThumb } = allMaps[currentMap];
    const infoString = `${displayText} Map`;

    return [
        <SEO 
            title={`${infoString}`}
            description={description}
            image={`${window.location.origin}${process.env.PUBLIC_URL}${imageThumb}`}
            card='summary_large_image'
        />,
        <div className="display-wrapper" key="map-wrapper">
            <Time
                currentMap={currentMap}
                normalizedName={normalizedName}
                duration={duration}
                players={players}
                source={source}
                sourceLink={sourceLink}
            />
            <TransformWrapper
                ref={ref}
                initialScale={1}
                centerOnInit={true}
                wheel={{
                    step: 0.2,
                }}
            >
                <TransformComponent>
                    <div className="map-image-wrapper">
                        <img
                            alt={`Map of ${displayText}`}
                            loading="lazy"
                            className="map-image"
                            title={infoString}
                            src={`${process.env.PUBLIC_URL}${image}`}
                        />
                    </div>
                </TransformComponent>
            </TransformWrapper>
        </div>,
    ];
}
export default Map;
