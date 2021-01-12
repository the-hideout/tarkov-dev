import {
    Link
} from 'react-router-dom';

import './index.css';

import rawMapData from '../../data/maps.json';

function Maps() {
    return <div
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
    </div>;
};

export default Maps;
