import {useState} from 'react';

import Switch from 'react-switch';
import Select from 'react-select';

import FilterIcon from '../FilterIcon.jsx';

import './index.css';

function ToggleFilter ({label, onChange, checked}) {
    return <label
        className = {'filter-toggle-wrapper'}
    >
        <span
            className = {'filter-toggle-label'}
        >
            {label}
        </span>
        <Switch
            className = {'filter-toggle'}
            onChange = {onChange}
            checked = {checked}
        />
    </label>
}

function SelectFilter ({defaultValue, options, onChange}) {
    return  <Select
        defaultValue = {defaultValue}
        isMulti
        name = "colors"
        options = {options}
        className = "basic-multi-select"
        onChange = {onChange}
        classNamePrefix = "select"
    />
};

function InputFilter ({defaultValue, type, placeholder, onChange}) {
    return <input
        className = 'filter-input'
        defaultValue = {defaultValue}
        type = {type}
        placeholder = {placeholder}
        onChange = {onChange}
    />
}

function Filter ({children}) {
    const [showFilter, setShowFilter] = useState(false);
    return [
        <div
            className = {'filter-toggle-icon-wrapper'}
            key = 'filter-toggle-icon'
            onClick = {e => setShowFilter(!showFilter)}
        >
            <FilterIcon />
        </div>,
        <div
            className = {`item-group-wrapper filter-wrapper ${showFilter ? 'open': ''}`}
            key = 'page-filter'
        >
            <div
                className = {'filter-content-wrapper'}
            >
                <div
                    className = {'text-label'}
                >
                    {`Prices updated: ${new Date().toLocaleDateString()}`}
                </div>
                { children }
            </div>
        </div>
    ];
}

export {
    Filter,
    ToggleFilter,
    SelectFilter,
    InputFilter
};