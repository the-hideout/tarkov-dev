/* eslint-disable no-restricted-globals */
import React, { useState, useMemo, useCallback, useEffect } from 'react';

import './App.css';
import Graph from './components/Graph.jsx';

import rawData from './data.json';

const styles = {
    updatedLabel: {
        fontSize: '10px',
        position: 'absolute',
        top: 2,
        left: 4,
        color: '#ccc',  
    },
};


const MAX_DAMAGE = 200;

const formattedData = rawData.data.map((ammoData) => {
    const returnData = {
        ...ammoData,
    };
    
    if(ammoData.damage > MAX_DAMAGE){
        returnData.name = `${ammoData.name} (${ammoData.damage})`;
        returnData.damage = MAX_DAMAGE;
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

function App() {
    const [selectedLegendName, setSelectedLegendName] = useState(decodeURIComponent(window.location.hash.substring(1)));

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
    
    const handleHashChange = useCallback(() => {
        setSelectedLegendName(decodeURIComponent(window.location.hash.substring(1)));

    }, [setSelectedLegendName]);
    
    useEffect(() => {
        window.addEventListener('hashchange', handleHashChange)
        return () => window.removeEventListener('hashchange', handleHashChange)
    }, [handleHashChange]);
    
    return <div className="App">
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
}

export default App;
