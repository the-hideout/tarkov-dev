import {useState} from 'react';
import {Helmet} from 'react-helmet';

import BartersTable from '../../components/barters-table';
import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage'
import {
    Filter,
    SelectFilter,
    InputFilter,
    ButtonGroupFilter,
    ButtonGroupFilterButton,
    ToggleFilter
} from '../../components/filter';

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
    const [includeFlea, setIncludeFlea] = useStateWithLocalStorage('includeFlea', false);
    const [selectedTrader, setSelectedTrader] = useStateWithLocalStorage('selectedTrader', 'all');
    const [levelTooltipDisabled, setLevelTooltipDisabled] = useState(false);

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
            className = 'barters-headline-wrapper'
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
            <Filter>
                <ButtonGroupFilter>
                    {traders.map((traderName) => {
                        return <ButtonGroupFilterButton
                            key = {`trader-tooltip-${traderName}`}
                            tooltipContent = {
                                <div>
                                    {capitalizeTheFirstLetterOfEachWord(traderName.replace('-', ' '))}
                                </div>
                            }
                            selected = {traderName === selectedTrader}
                            content = {<img
                                alt = {traderName}
                                title = {traderName}
                                src={`${process.env.PUBLIC_URL}/images/${traderName}-icon.jpg`}
                            />}
                            onClick = {setSelectedTrader.bind(undefined, traderName)}
                        />
                    })}
                    <ButtonGroupFilterButton
                        tooltipContent = {
                            <div>
                                Show all barters
                            </div>
                        }
                        selected = {selectedTrader === 'all'}
                        content = {'All'}
                        onClick = {setSelectedTrader.bind(undefined, 'all')}
                    />
                </ButtonGroupFilter>
                <ToggleFilter
                    checked = {includeFlea}
                    label = {'Flea?'}
                    onChange = {e => setIncludeFlea(!includeFlea)}
                    tooltipContent = {
                        <div>
                            Include flea market prices
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
                    label = 'Loyalty'
                    onChange={setLevelFilter}
                    options={levels}
                    tooltip = {
                        <div>
                            Sets maximum loyalty level for traders
                        </div>
                    }
                    onMenuOpen = {e => setLevelTooltipDisabled(true)}
                    onMenuClose = {e => setLevelTooltipDisabled(false)}
                />
            </Filter>
        </div>,
        <BartersTable
            levelFilter = {levelFilter}
            nameFilter = {nameFilter}
            selectedTrader = {selectedTrader}
            includeFlea = {includeFlea}
            key = 'barters-page-barters-table'
        />
    ];
};

export default Barters;