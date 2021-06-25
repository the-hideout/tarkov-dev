import {useState} from 'react';
import {Helmet} from 'react-helmet';

import CraftsTable from '../../components/crafts-table';
import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage';
import {
    Filter,
    SelectFilter,
    InputFilter,
    ButtonGroupFilter,
    ButtonGroupFilterButton,
    ToggleFilter,
} from '../../components/filter';

import Icon from '@mdi/react'
import { mdiProgressWrench } from '@mdi/js';

import './index.css';

const levels = [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
];

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
    const defaultQuery = new URLSearchParams(window.location.search).get('search');
    const [nameFilter, setNameFilter] = useState(defaultQuery || '');
    const [levelFilter, setLevelFilter] = useState(levels[2]);
    const [levelTooltipDisabled, setLevelTooltipDisabled] = useState(false);
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
            className = 'crafts-headline-wrapper'
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
            <Filter>
                <ButtonGroupFilter>
                    {stations.map((stationName) => {
                        return <ButtonGroupFilterButton
                            key = {`station-tooltip-${stationName}`}
                            tooltipContent={
                                <div>
                                    {capitalizeTheFirstLetterOfEachWord(stationName.replace('-', ' '))}
                                </div>
                            }
                            selected = { stationName === selectedStation }
                            content = { <img
                                alt = {stationName}
                                title = {stationName}
                                src={`${process.env.PUBLIC_URL}/images/${stationName}-icon.png`}
                            /> }
                            onClick={setSelectedStation.bind(undefined, stationName)}
                        />
                    })}
                    <ButtonGroupFilterButton
                        tooltipContent = {
                            <div>
                                Most profitable craft in each station
                            </div>
                        }
                        selected = {false}
                        content = {'All'}
                        onClick={setSelectedStation.bind(undefined, 'top')}
                    />
                 </ButtonGroupFilter>
                 <ToggleFilter
                    checked = {freeFuel}
                    label = {'Fuel is free'}
                    onChange = {e => setFreeFuel(!freeFuel)}
                    tooltipContent = {
                        <div>
                            Sets all fuel prices to 0, as that's more or less the case if you use fuel to power your hideout
                        </div>
                    }
                />
                <InputFilter
                    defaultValue = {nameFilter || ''}
                    label = 'Item filter'
                    type = {'text'}
                    placeholder = {'filter on item'}
                    onChange = {e => setNameFilter(e.target.value)}
                />
                <SelectFilter
                    defaultValue={levelFilter}
                    tooltipDisabled = {levelTooltipDisabled}
                    name = "levels"
                    label = 'Level'
                    onChange={setLevelFilter}
                    options={levels}
                    tooltip = {
                        <div>
                            Sets maximum level of craft stations
                        </div>
                    }
                    onMenuOpen = {e => setLevelTooltipDisabled(true)}
                    onMenuClose = {e => setLevelTooltipDisabled(false)}
                />
            </Filter>
        </div>,
        <CraftsTable
            levelFilter = {levelFilter}
            nameFilter = {nameFilter}
            freeFuel = {freeFuel}
            selectedStation = {selectedStation}
            key = 'crafts-page-crafts-table'
        />
    ];
};

export default Crafts;
