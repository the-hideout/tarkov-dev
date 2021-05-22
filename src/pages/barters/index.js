import {useState} from 'react';
import {Helmet} from 'react-helmet';
import Select from 'react-select';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // optional

import BartersTable from '../../components/barters-table';
import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage'

import Icon from '@mdi/react'
import { mdiAccountSwitch } from '@mdi/js';

import './index.css';

const levels = [
    { value: 1, label: '1'},
    { value: 2, label: '2'},
    { value: 3, label: '3'},
    { value: 4, label: '4'},
]

const traders = [
    'prapor',
    'therapist',
    'skier',
    'peacekeeper',
    'mechanic',
    'jaeger',
];

function capitalizeTheFirstLetterOfEachWord(words) {
    const separateWord = words.toLowerCase().split(' ');

    for (let i = 0; i < separateWord.length; i = i + 1) {
       separateWord[i] = separateWord[i].charAt(0).toUpperCase() +
       separateWord[i].substring(1);
    }

    return separateWord.join(' ');
}

function Barters() {
    const defaultQuery = new URLSearchParams(window.location.search).get('search');
    const [nameFilter, setNameFilter] = useState(defaultQuery || '');
    const [levelFilter, setLevelFilter] = useState(levels[3]);
    const [levelTooltipDisabled, setLevelTooltipDisabled] = useState(false);
    const hideLevelTooltip = () => setLevelTooltipDisabled(true);
    const showLevelTooltip = () => setLevelTooltipDisabled(false);
    const [selectedTrader, setSelectedTrader] = useStateWithLocalStorage('selectedTrader', 'all');

    return [
        <Helmet
            key = {'loot-tier-helmet'}
        >
            <meta
                charSet='utf-8'
            />
            <title>
                Escape from Tarkov barter profits
            </title>
            <meta
                name = 'description'
                content = 'Escape from Tarkov barter profits'
            />
        </Helmet>,
        <div
            className = 'data-table-filters-wrapper'
            key = 'barters-filters'
        >
            <h1
                className = 'barters-page-title'
            >
                <Icon
                    path={mdiAccountSwitch}
                    size={1.5}
                    className = 'icon-with-text'
                />
                Barter profits
            </h1>
            <div className = 'button-group-wrapper'>
                {traders.map((traderName) => {
                    return <Tippy
                        placement = 'top'
                        content={
                        <div>
                            {capitalizeTheFirstLetterOfEachWord(traderName.replace('-', ' '))}
                        </div>
					}>
                        <button
                            className = {`button-group-button ${traderName === selectedTrader ? 'selected': ''}`}
                            key = {`trader-selector-button-${traderName}`}
                            onClick={setSelectedTrader.bind(undefined, traderName)}
                        ><img
                            alt = {traderName}
                            title = {traderName}
                            src={`${process.env.PUBLIC_URL}/images/${traderName}-icon.jpg`}
                        /></button>
                    </Tippy>
				})}
                <Tippy
                    placement = 'top'
                    content={
                    <div>
                        Show all barters
                    </div>
                }>
                    <button
                        className = {`button-group-button ${'all' === selectedTrader ? 'selected': ''}`}
                        title = 'All Traders Barters'
                        onClick={setSelectedTrader.bind(undefined, 'all')}
                    >
                        All
                    </button>
                </Tippy>
            </div>
            <div
                className = 'filter-input-wrapper'
            >
                <div
                    className = 'filter-input-label'
                >
                    Item filter
                </div>
                <input
                    defaultValue = {nameFilter || ''}
                    type = {'text'}
                    placeholder = {'filter on item'}
                    onChange = {e => setNameFilter(e.target.value)}
                />
            </div>
            <Tippy
                disabled = {levelTooltipDisabled}
                placement = 'bottom'
                content={
                    <div>
                        Sets maximum loyalty level for traders
                    </div>
                }
            >
                <div
                    className = 'filter-dropdown-wrapper'
                >
                    <div
                        className = 'filter-dropdown-label'
                    >
                        Loyalty
                    </div>
                    <Select
                        defaultValue={levelFilter}
                        name="levels"
                        onChange={setLevelFilter}
                        options={levels}
                        className="filter-dropdown-select"
                        classNamePrefix="select"
                        onMenuOpen={hideLevelTooltip}
                        onMenuClose={showLevelTooltip}
                    />
                </div>
            </Tippy>
        </div>,
        <BartersTable
            levelFilter = {levelFilter}
            nameFilter = {nameFilter}
            selectedTrader = {selectedTrader}
            key = 'barters-page-barters-table'
        />
    ];
};

export default Barters;