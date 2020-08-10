/* eslint-disable no-restricted-globals */
import React, { useState, useMemo, useCallback, useEffect } from 'react';

import Graph from './Graph.jsx';

import rawData from '../data.json';

const styles = {
    updatedLabel: {
        fontSize: '10px',
        position: 'absolute',
        top: 2,
        left: 4,
        color: '#ccc',  
    },
};

const MAX_DAMAGE = 170;
const MAX_PENETRATION = 70;

const formattedData = rawData.data.map((ammoData) => {
    const returnData = {
        ...ammoData,
    };
    
    if(ammoData.damage > MAX_DAMAGE){
        returnData.name = `${ammoData.name} (${ammoData.damage})`;
        returnData.damage = MAX_DAMAGE;
    }
    
    if(ammoData.penetration > MAX_PENETRATION){
        returnData.name = `${ammoData.name} (${ammoData.penetration})`;
        returnData.penetration = MAX_PENETRATION;
    }
    
    return returnData;
})
.sort((a, b) => {
    return a.type.localeCompare(b.type);
});

let typeCache = [];
const legendData = formattedData.map((ammo) => {
    if (typeCache.includes(ammo.type)){
        return false;
    }

    typeCache.push(ammo.type);

    return {
        name: ammo.type,
        symbol: ammo.symbol,
    }
}).filter(Boolean);

function Ammo(props) {
    const [selectedLegendName, setSelectedLegendName] = useState(props.selectedAmmo);
    
    useEffect(() => {
        if(props.selectedAmmo === 'all'){
            setSelectedLegendName();
            
            return true;
        }
        
        setSelectedLegendName(props.selectedAmmo);
    }, [props.selectedAmmo]);

    const listState = useMemo(() => {
        return formattedData.filter(ammo =>
            !selectedLegendName || ammo.type === selectedLegendName
        );
    }, [selectedLegendName]);

    const handleLegendClick = useCallback((event, { datum: { name } }) => {
        if (selectedLegendName === name) {
            setSelectedLegendName();
            history.replaceState(undefined, undefined, '#');
        } else {
            setSelectedLegendName(name);
            history.replaceState(undefined, undefined, `#${name}`);
        }

    }, [selectedLegendName, setSelectedLegendName]);
    
    if(!props.show){
        return true;
    }
    
    return (
        <div>
            <div
                style = { styles.updatedLabel }
            >
                {`Ammo updated: ${new Date(rawData.updated).toLocaleDateString()}`}        
            </div>
            <Graph
                rawData = {rawData}
                listState = {listState}
                legendData = {legendData}
                selectedLegendName = {selectedLegendName}
                handleLegendClick = {handleLegendClick}
                yMax = {MAX_DAMAGE}
            />
        </div>
    );
}

export default Ammo;
