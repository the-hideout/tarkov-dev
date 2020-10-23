/* eslint-disable no-restricted-globals */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
    useParams,
    useHistory,
} from "react-router-dom";

import Graph from './Graph.jsx';
import useKeyPress from '../hooks/useKeyPress';

import rawData from '../data.json';

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
        ...ammo,
        name: ammo.type,
        symbol: ammo.symbol,
    }
}).filter(Boolean);

function Ammo() {
    const {currentAmmo} = useParams();
    let currentAmmoList = [];
    if(currentAmmo){
        currentAmmoList = currentAmmo.split(',');
    }
    const history = useHistory();
    const [selectedLegendName, setSelectedLegendName] = useState(currentAmmoList);
    const shiftPress = useKeyPress('Shift');

    useEffect(() => {
        if(currentAmmo === []){
            setSelectedLegendName([]);

            return true;
        }

        if(currentAmmo){
            setSelectedLegendName(currentAmmo.split(','));
        } else {
            setSelectedLegendName([]);
        }
    }, [currentAmmo]);

    const listState = useMemo(() => {
        return formattedData.filter(ammo =>
            !selectedLegendName || selectedLegendName.length === 0 || selectedLegendName.includes(ammo.type)
        ).map((ammo) => {
            if(!shiftPress){
                return ammo;
            }

            return {
                ...ammo,
                name: `${ammo.name} (${ammo.fragChance})`,
            };
        });
    }, [selectedLegendName, shiftPress]);

    const handleLegendClick = useCallback((event, { datum: { name } }) => {
        let newSelectedAmmo = [...selectedLegendName];
        const metaKey = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;

        if(newSelectedAmmo.includes(name) && metaKey){
            newSelectedAmmo.splice(newSelectedAmmo.indexOf(name), 1);
        } else if(newSelectedAmmo.includes(name)){
            newSelectedAmmo = [];
        } else if(metaKey){
            newSelectedAmmo.push(name);
        } else {
            newSelectedAmmo = [name];
        }

        setSelectedLegendName(newSelectedAmmo);
        history.push(`/ammo/${newSelectedAmmo.join(',')}`);

    }, [selectedLegendName, setSelectedLegendName, history]);

    return (
        <div>
            <div
                className = {'updated-label'}
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
