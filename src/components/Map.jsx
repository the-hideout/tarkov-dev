import React from 'react';
import {
    useParams,
} from "react-router-dom";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

import rawMapData from '../map-data.json';

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
    
    return <TransformWrapper
        defaultScale={1}
        wheel = {{
            step: 200,
        }}
    >
        <TransformComponent>
            <img 
                alt = {`Map of ${maps[currentMap].displayText}`}
                className = "map-image"
                title = {`Map of ${maps[currentMap].displayText}`}
                src = {`${process.env.PUBLIC_URL}${maps[currentMap].image}`}
            />
        </TransformComponent>
    </TransformWrapper>;
}

export default Map;
