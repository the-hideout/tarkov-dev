import {useState} from 'react';
import Switch from 'react-switch';
import Select from 'react-select';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // optional

import FilterIcon from '../FilterIcon.jsx';

import './index.css';

const ConditionalWrapper = ({ condition, wrapper, children }) => {
    return condition ? wrapper(children) : children;
};

function ButtonGroupFilterButton ({tooltipContent, onClick, content, selected}) {
    return <Tippy
        placement = 'top'
        content={tooltipContent}
    >
        <button
            className = {`button-group-button ${selected ? 'selected': ''}`}

            onClick={onClick}
        >
            {content}
        </button>
    </Tippy>
};

function ButtonGroupFilter ({children}) {
    return <div
        className = 'button-group-wrapper'
    >
        {children}
    </div>
};

function SliderFilter ({label, defaultValue, min, max, marks, onChange, reverse = false}) {
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
            reverse = {reverse}
            style = {{
                top: '-7px',
                width: '170px',
            }}
        />
    </div>
};

function ToggleFilter ({label, onChange, checked, tooltipContent}) {
    return <ConditionalWrapper
        condition = {tooltipContent}
        wrapper = {
            children => {
                return <Tippy
                    placement = 'bottom'
                    content = {tooltipContent}
                >
                    {children}
                </Tippy>
            }
        }
        >
        <label
            className = {'single-filter-wrapper'}
        >
            <span
                className = {'single-filter-label'}
            >
                {label}
            </span>
            <Switch
                className = {'filter-toggle'}
                onChange = {onChange}
                checked = {checked}
            />
        </label>
    </ConditionalWrapper>
};

function SelectFilter ({defaultValue, options, onChange, isMulti = false, label, tooltip, tooltipDisabled, onMenuOpen, onMenuClose}) {
    return <ConditionalWrapper
        condition = {tooltip}
        wrapper = {
            children => {
                return <Tippy
                    disabled = {tooltipDisabled}
                    placement = 'bottom'
                    content = {tooltip}
                >
                    {children}
                </Tippy>
            }
        }
    >
        <label
            className = {'single-filter-wrapper'}
        >
            <span
                className = {'single-filter-label'}
            >
                {label}
            </span>
            <Select
                defaultValue = {defaultValue}
                isMulti = {isMulti}
                name = "colors"
                options = {options}
                className = "basic-multi-select"
                onChange = {onChange}
                classNamePrefix = "select"
                onMenuClose = {onMenuClose}
                onMenuOpen = {onMenuOpen}
            />
        </label>
    </ConditionalWrapper>;
};

function InputFilter ({defaultValue, type, placeholder, onChange, label}) {
    return <label
        className = {'single-filter-wrapper'}
    >
        <span
            className = {'single-filter-label'}
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
    SliderFilter,
    ButtonGroupFilter,
    ButtonGroupFilterButton
};