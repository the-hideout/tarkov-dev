import React from 'react';

import interchange from '../maps/interchange.jpg';
import customs from '../maps/customs.jpg';
import dorms from '../maps/dorms.jpg';
import factory from '../maps/factory.jpg';
import labs from '../maps/labs.jpg';
import reserve from '../maps/reserve.jpg';
import resort from '../maps/resort.jpg';
import shoreline from '../maps/shoreline.jpg';
import woods from '../maps/woods.jpg';

const maps = {
    interchange: interchange,
    customs: customs,
    dorms: dorms,
    factory: factory,
    labs: labs,
    reserve: reserve,
    resort: resort,
    shoreline: shoreline,
    woods: woods,
};

function Map(props) {
    if(!props.show){
        return true;
    }
    
    return <img 
        alt = {`Map of ${props.selectedMap}`}
        title = {`Map of ${props.selectedMap}`}
        src = {maps[props.selectedMap]}
    />
}

export default Map;
