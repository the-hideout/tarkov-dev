import {useState} from 'react';
import Switch from 'react-switch';
import Select from 'react-select';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import FilterIcon from '../FilterIcon.jsx';

import './index.css';

function SliderFilter ({label, defaultValue, min, max, marks, onChange}) {
    return <div
        className = {'filter-slider-wrapper'}
    >
        <div
            className = {'filter-slider-label'}
        >
            {label}
        </div>
        <Slider
            defaultValue = {defaultValue}
            min = {min}
            max = {max}
            marks = {marks}
            onChange = {onChange}
            trackStyle = {{
                backgroundColor: '#048802',
            }}
            handleStyle = {{
                backgroundColor: '#048802',
                borderColor: '#048802',
            }}
            activeDotStyle = {{
                backgroundColor: '#048802',
                borderColor: '#048802',
            }}
            reverse
            style = {{
                top: '-7px',
                width: '170px',
            }}
        />
    </div>
};

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
    return <Select
        defaultValue = {defaultValue}
        isMulti
        name = "colors"
        options = {options}
        className = "basic-multi-select"
        onChange = {onChange}
        classNamePrefix = "select"
    />
};

function InputFilter ({defaultValue, type, placeholder, onChange, label}) {
    return <label
        className = {'filter-toggle-wrapper'}
    >
        <span
            className = {'filter-toggle-label'}
        >
            {label}
        </span>
        <input
            className = 'filter-input'
            defaultValue = {defaultValue}
            type = {type}
            placeholder = {placeholder}
            onChange = {onChange}
        />
    </label>
}

function Filter ({center, children}) {
    const [showFilter, setShowFilter] = useState(false);
    return [
        <div
            className = {`filter-toggle-icon-wrapper`}
            key = 'filter-toggle-icon'
            onClick = {e => setShowFilter(!showFilter)}
        >
            <FilterIcon />
        </div>,
        <div
            className = {`filter-wrapper ${showFilter ? 'open': ''} ${center ? 'filter-wrapper-center': ''}`}
            key = 'page-filter'
        >
            <div
                className = {'filter-content-wrapper'}
            >
                {/* <div
                    className = {'text-label'}
                >
                    {`Prices updated: ${new Date().toLocaleDateString()}`}
                </div> */}
                { children }
            </div>
        </div>
    ];
}

export {
    Filter,
    ToggleFilter,
    SelectFilter,
    InputFilter,
    SliderFilter
};