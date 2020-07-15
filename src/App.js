import React, { useState, useMemo, useCallback } from 'react';

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
    const [selectedLegendName, setSelectedLegendName] = useState();

    const listState = useMemo(() => {
        return formattedData.filter(ammo =>
            !selectedLegendName || ammo.type === selectedLegendName
        );
    }, [selectedLegendName]);

    const handleLegendClick = useCallback((event, { datum: { name } }) => {
        if (selectedLegendName === name) {
            setSelectedLegendName();
        } else {
            setSelectedLegendName(name);
        }

    }, [selectedLegendName, setSelectedLegendName]);
    
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
