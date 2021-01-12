import {
    useParams,
} from 'react-router-dom';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import {Helmet} from 'react-helmet';

import Time from './Time';

import rawMapData from '../data/maps.json';

const maps = Object.fromEntries(rawMapData.map((mapData) => {
    return [
        mapData.key,
        {
            ...mapData,
            image: `/maps/${mapData.key}.jpg`,
        },
    ];
}));

function Map() {
    let {currentMap} = useParams();

    const { displayText, image, source, sourceLink } = maps[currentMap];
    const infoString = `Escape from Tarkov ${displayText} map`

    return [
        <Helmet>
            <meta
                charSet='utf-8'
            />
            <title>
                {infoString}
            </title>
            <meta
                name = 'description'
                content = {infoString}
            />
        </Helmet>,
        <div>
            <Time
                currentMap = {currentMap}
                source = {source}
                sourceLink = {sourceLink}
            />
            <TransformWrapper
                defaultScale={1}
                wheel = {{
                    step: 200,
                }}
            >
                <TransformComponent>
                    <div
                        className = 'map-image-wrapper'
                    >
                        <img
                            alt = {`Map of ${ displayText }`}
                            className = 'map-image'
                            title = {infoString}
                            src = {`${ process.env.PUBLIC_URL }${ image }`}
                        />
                    </div>
                </TransformComponent>
            </TransformWrapper>
        </div>
    ];
}

export default Map;
