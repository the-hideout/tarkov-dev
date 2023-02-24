import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    TransformWrapper,
    TransformComponent,
} from 'react-zoom-pan-pinch';

import { useMapImages } from '../features/maps/queries';

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

    const { displayText, author, authorLink, normalizedName, description, duration, players, image, imageThumb } = allMaps[currentMap];

    return [
        <SEO 
            title={`${displayText} - ${t('Escape from Tarkov')} - ${t('Tarkov.dev')}`}
            description={description}
            image={`${window.location.origin}${process.env.PUBLIC_URL}${imageThumb}`}
            card='summary_large_image'
            key="seo-wrapper"
        />,
        <div className="display-wrapper" key="map-wrapper">
            <Time
                currentMap={currentMap}
                normalizedName={normalizedName}
                duration={duration}
                players={players}
                author={author}
                authorLink={authorLink}
            />
            <TransformWrapper
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
        </div>,
    ];
}
export default Map;
