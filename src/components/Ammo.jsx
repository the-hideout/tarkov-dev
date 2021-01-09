/* eslint-disable no-restricted-globals */
import { useState, useMemo, useCallback, useEffect } from 'react';
import {
    useParams,
    useHistory,
} from "react-router-dom";

import Graph from './Graph.jsx';
import useKeyPress from '../hooks/useKeyPress';

import rawData from '../data/ammo.json';

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
    const [maxPenetration, setMaxPenetration] = useState(MAX_PENETRATION);
    const [minPenetration, setMinPenetration] = useState(0);
    const [maxDamage, setMaxDamage] = useState(MAX_DAMAGE);
    const [minDamage, setMinDamage] = useState(0);

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
        let tempMaxPen = 0;
        let tempMinPen = MAX_PENETRATION;
        let tempMaxDmg = 0;
        let tempMinDmg = MAX_DAMAGE;

        const returnData = formattedData.filter(ammo =>
            !selectedLegendName || selectedLegendName.length === 0 || selectedLegendName.includes(ammo.type)
        ).map((ammo) => {
            if(ammo.penetration > tempMaxPen){
                tempMaxPen = ammo.penetration;
            }

            if (ammo.penetration < tempMinPen ){
                tempMinPen = ammo.penetration;
            }

            if(ammo.damage > tempMaxDmg){
                tempMaxDmg = ammo.damage;
            }

            if(ammo.damage < tempMinDmg){
                tempMinDmg = ammo.damage;
            }

            if(!shiftPress){
                return ammo;
            }

            return {
                ...ammo,
                name: `${ammo.name} (${ammo.fragChance})`,
            };
        });

        setMaxPenetration(tempMaxPen);
        setMinPenetration(tempMinPen);
        setMaxDamage(tempMaxDmg);
        setMinDamage(tempMinDmg);

        return returnData;
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

    return [
        <div
            className = {'updated-label'}
            key = {'ammo-updated-label'}
        >
            {`Ammo updated: ${new Date(rawData.updated).toLocaleDateString()}`}
        </div>,
        <Graph
            key = 'ammo-graph'
            listState = {listState}
            legendData = {legendData}
            selectedLegendName = {selectedLegendName}
            handleLegendClick = {handleLegendClick}
            xMax = {MAX_DAMAGE}
            yMax = {MAX_PENETRATION}
        />
    ];
}

export default Ammo;
