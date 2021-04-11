import {useState} from 'react';
import {Helmet} from 'react-helmet';
import Switch from 'react-switch';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // optional

import CraftsTable from '../../components/crafts-table';
import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage'

import Icon from '@mdi/react'
import { mdiProgressWrench } from '@mdi/js';

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

function capitalizeTheFirstLetterOfEachWord(words) {
    const separateWord = words.toLowerCase().split(' ');

    for (let i = 0; i < separateWord.length; i = i + 1) {
       separateWord[i] = separateWord[i].charAt(0).toUpperCase() +
       separateWord[i].substring(1);
    }

    return separateWord.join(' ');
}

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
                <Icon
                    path={mdiProgressWrench}
                    size={1.5}
                    className = 'icon-with-text'
                />
                Hideout Crafts
            </h1>
            <div className = 'button-group-wrapper'>
                {stations.map((stationName) => {
                    return <Tippy
                        placement = 'top'
                        content={
                        <div>
                            {capitalizeTheFirstLetterOfEachWord(stationName.replace('-', ' '))}
                        </div>
                    }>
                        <button
                            className = {`button-group-button ${stationName === selectedStation ? 'selected': ''}`}
                            key = {`station-selector-button-${stationName}`}
                            onClick={setSelectedStation.bind(undefined, stationName)}
                        ><img
                            alt = {stationName}
                            title = {stationName}
                            src={`${process.env.PUBLIC_URL}/images/${stationName}-icon.png`}
                        /></button>
                    </Tippy>
                })}
                <Tippy
                    placement = 'top'
                    content={
                    <div>
                        Most profitable craft in each station
                    </div>
                }>
                    <button
                        className = {`button-group-button ${'top' === selectedStation ? 'selected': ''}`}
                        title = 'Top crafts in each station'
                        onClick={setSelectedStation.bind(undefined, 'top')}
                    >
                        Top
                    </button>
                </Tippy>
            </div>
            <Tippy
                placement = 'bottom'
                content={
                <div>
                    Sets all fuel prices to 0, as that's more or less the case if you use fuel to power your hideout
                </div>
            }>
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
            </Tippy>
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
        <CraftsTable
            nameFilter = {nameFilter}
            freeFuel = {freeFuel}
            selectedStation = {selectedStation}
            key = 'crafts-page-crafts-table'
        />
    ];
};

export default Crafts;
