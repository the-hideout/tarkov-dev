import React from 'react';

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

function Map(props) {
    if(!props.show){
        return true;
    }
    
    return <img 
        alt = {`Map of ${maps[props.selectedMap].displayText}`}
        title = {`Map of ${maps[props.selectedMap].displayText}`}
        src = {`${process.env.PUBLIC_URL}${maps[props.selectedMap].image}`}
    />
}

export default Map;
