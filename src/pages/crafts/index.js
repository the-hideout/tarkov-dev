import {useState} from 'react';
import {Helmet} from 'react-helmet';
import Switch from 'react-switch';

import CraftTable from '../../components/craft-table';
import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage'

import './index.css';

const stations = [
    'booze-generator',
    'intelligence-center',
    'lavatory',
    'medstation',
    'nutrition-unit',
    'water-collector',
    'workbench',
];

function Crafts() {
    const [nameFilter, setNameFilter] = useState('');
    const [freeFuel, setFreeFuel] = useState(false);
    const [selectedStation, setSelectedStation] = useStateWithLocalStorage('selectedStation', 'top');

    return [
        <Helmet
            key = {'loot-tier-helmet'}
        >
            <meta
                charSet='utf-8'
            />
            <title>
                Escape from Tarkov Hideout craft profits
            </title>
            <meta
                name = 'description'
                content = 'Escape from Tarkov Hideout craft profits'
            />
        </Helmet>,
        <div
            className = 'data-table-filters-wrapper'
            key = 'crafts-filters'
        >
            <h1
                className = 'crafts-page-title'
            >
                Hideout craft profits
            </h1>
            <div className = 'button-group-wrapper'>
                {stations.map((stationName) => {
                    return <button
                        className = {`button-group-button ${stationName === selectedStation ? 'selected': ''}`}
                        key = {`station-selector-button-${stationName}`}
                        onClick={setSelectedStation.bind(undefined, stationName)}
                    ><img
                            alt = {stationName}
                            title = {stationName}
                            src={`${process.env.PUBLIC_URL}/images/${stationName}-icon.png`}
                        /></button>
                })}
                <button
                    className = {`button-group-button ${'top' === selectedStation ? 'selected': ''}`}
                    title = 'Top crafts in each station'
                    onClick={setSelectedStation.bind(undefined, 'top')}
                >
                    Top
                </button>
            </div>
            <label
                className = {'filter-toggle-wrapper'}
            >
                <div
                    className = {'filter-toggle-label'}
                >
                    Fuel is free
                </div>
                <Switch
                    className = {'filter-toggle'}
                    onChange = {e => setFreeFuel(!freeFuel)}
                    checked = {freeFuel}
                />
            </label>
            <div
                className = 'filter-input-wrapper'
            >
                <div
                    className = 'filter-input-label'
                >
                    Item filter
                </div>
                <input
                    defaultValue = {nameFilter || ''}
                    type = {'text'}
                    placeholder = {'filter on item'}
                    onChange = {e => setNameFilter(e.target.value)}
                />
            </div>
        </div>,
        <CraftTable
            nameFilter = {nameFilter}
            freefuel = {freeFuel}
            selectedStation = {selectedStation}
        />
    ];
};

export default Crafts;
