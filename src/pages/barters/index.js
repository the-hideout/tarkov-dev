import {useState} from 'react';
import {Helmet} from 'react-helmet';

import BartersTable from '../../components/barters-table';

import Icon from '@mdi/react'
import { mdiAccountSwitch } from '@mdi/js';

import './index.css';

function Barters() {
    const [nameFilter, setNameFilter] = useState('');

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
        <BartersTable
            nameFilter = {nameFilter}
        />
    ];
};

export default Barters;
