import {
    Link
} from 'react-router-dom';
import {Helmet} from 'react-helmet';

import './index.css';

import rawMapData from '../../data/maps.json';

function Maps() {
    return [
        <Helmet>
            <meta
                charSet='utf-8'
            />
            <title>
                Escape from Tarkov maps
            </title>
            <meta
                name = 'description'
                content = 'Escape from Tarkov maps'
            />
        </Helmet>,
        <div
            className = {'page-wrapper'}
        >
            <h1>
                Escape from Tarkov maps
            </h1>
            <div
                className = 'maps-wrapper'
            >
                {
                    rawMapData.map((map) => {
                        const { displayText, key } = map;
                        return <div
                            className = 'map-wrapper'
                            key = {`map-wrapper-${key}`}
                        >
                            <h2>
                                {displayText}
                            </h2>
                            <Link
                                to = {`/map/${key}`}
                            >
                                <img
                                    alt = {`Map of ${ displayText }`}
                                    className = 'map-image'
                                    title = {`Map of ${ displayText }`}
                                    src = {`${ process.env.PUBLIC_URL }/maps/${key}.jpg`}
                                />
                        </Link>
                        </div>;
                    })
                }
            </div>
        </div>
    ];
};

export default Maps;
