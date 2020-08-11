import React from 'react';
import {
    useParams,
  } from "react-router-dom";

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
    
    return <img 
        alt = {`Map of ${maps[currentMap].displayText}`}
        className = "map-image"
        title = {`Map of ${maps[currentMap].displayText}`}
        src = {`${maps[currentMap].image}`}
    />
}

export default Map;
