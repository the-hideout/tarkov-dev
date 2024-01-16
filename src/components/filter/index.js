import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Switch from 'react-switch';
import Select from 'react-select';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // optional

import './index.css';
import { Fab } from '@mui/material';
import { mdiTune } from '@mdi/js';
import { Icon } from '@mdi/react';
import { t } from 'i18next';

const ConditionalWrapper = ({ condition, wrapper, children }) => {
    return condition ? wrapper(children) : children;
};

function ButtonGroupFilterButton({
    tooltipContent,
    onClick,
    content,
    selected,
    type = 'image',
}) {
    return (
        <Tippy placement="top" content={tooltipContent}>
            <button
                className={`button-group-button button-group-${type}-button ${
                    selected ? 'selected' : ''
                }`}
                onClick={onClick}
            >
                {content}
            </button>
        </Tippy>
    );
}

function ButtonGroupFilter({ children }) {
    return <div className="button-group-wrapper">{children}</div>;
}

function SliderFilter({
    label,
    defaultValue,
    min,
    max,
    marks,
    onChange,
    reverse = false,
}) {
    return (
        <div className={'filter-slider-wrapper'}>
            <div className={'filter-slider-label'}>{label}</div>
            <Slider
                defaultValue={defaultValue}
                min={min}
                max={max}
                marks={marks}
                onChange={onChange}
                trackStyle={{
                    backgroundColor: '#048802',
                }}
                handleStyle={{
                    backgroundColor: '#048802',
                    borderColor: '#048802',
                }}
                activeDotStyle={{
                    backgroundColor: '#048802',
                    borderColor: '#048802',
                }}
                reverse={reverse}
                style={{
                    top: '-7px',
                    width: '170px',
                }}
            />
        </div>
    );
}

function RangeFilter({
    label,
    defaultValue,
    min,
    max,
    marks,
    onChange,
    reverse = false,
}) {
    return (
        <div className={'filter-slider-wrapper'}>
            <div className={'filter-slider-label'}>{label}</div>
            <Slider
                range={true}
                allowCross={false}
                defaultValue={defaultValue}
                step={2}
                min={min}
                max={max}
                marks={marks}
                onChange={onChange}
                trackStyle={[
                    {
                        backgroundColor: '#048802',
                    },
                ]}
                // railStyle={{
                //     backgroundColor: '#048802',
                // }}
                handleStyle={[
                    {
                        backgroundColor: '#048802',
                        borderColor: '#048802',
                    },
                    {
                        backgroundColor: '#048802',
                        borderColor: '#048802',
                    },
                ]}
                activeDotStyle={{
                    backgroundColor: '#048802',
                    borderColor: '#048802',
                }}
                // dotStyle={{
                //     backgroundColor: '#048802',
                //     borderColor: '#048802',
                // }}
                reverse={reverse}
                style={{
                    top: '-7px',
                    width: '170px',
                }}
            />
        </div>
    );
}

function ToggleFilter({ label, onChange, checked, tooltipContent, disabled }) {
    return (
        <ConditionalWrapper
            condition={tooltipContent}
            wrapper={(children) => {
                return (
                    <Tippy placement="bottom" content={tooltipContent}>
                        {children}
                    </Tippy>
                );
            }}
        >
            <label className={'single-filter-wrapper'}>
                <span className={'single-filter-label'}>{label}</span>
                <Switch
                    borderRadius={5}
                    className={'filter-toggle'}
                    onChange={onChange}
                    // onColor='#008800'
                    height={20}
                    width={40}
                    checked={checked}
                    disabled={disabled}
                />
            </label>
        </ConditionalWrapper>
    );
}

const selectFilterStyle = {
    multiValueLabel: (provided) => ({
        ...provided,
        color: '#E0DFD6',
        padding: '0.1rem'
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: '#2d2d2f',
        border: '2px solid #9a8866',
        borderRadius: 0,
    }),
    control: (provided) => ({
        ...provided,
        backgroundColor: '#2d2d2f',
        border: '2px solid #9a8866',
        borderRadius: 0,
    }),
    menuList: (provided) => ({
        ...provided,
        color: '#E5E5E5',
        borderRadius: 0,
    }),
    option: (provided) => ({
        ...provided,
        color: '#E5E5E5',
        backgroundColor: '#2d2d2f',

        borderRadius: 0,
        '&:hover': {
            backgroundColor: '#9a8866',
            color: '#2d2d2f',
            fontweight: 700,
        },
    }),
    singleValue: (provided) => ({
        ...provided,
        color: '#c7c5b3',
    }),
    multiValue: (provided) => ({
        ...provided,
        backgroundColor: '#5F553B',
        color: '#E5E5E5',
    }),
};

function SelectFilter({
    placeholder,
    defaultValue,
    value,
    options,
    onChange,
    isMulti = false,
    label,
    tooltip,
    tooltipDisabled,
    onMenuOpen,
    onMenuClose,
    wide,
    parentRef,
}) {
    return (
        <ConditionalWrapper
            condition={tooltip}
            wrapper={(children) => {
                return (
                    <Tippy
                        disabled={tooltipDisabled}
                        placement="bottom"
                        content={tooltip}
                    >
                        {children}
                    </Tippy>
                );
            }}
        >
            <ConditionalWrapper
                condition={label}
                wrapper={(labelChildren) => {
                    return (
                        <label
                            className={`single-filter-wrapper ${
                                wide ? 'single-filter-wrapper-wide' : ''
                            }`}
                        >
                            <span className={'single-filter-label'}>{label}</span>
                            {labelChildren}
                        </label>
                    )
                }}
            >
                <Select
                    className="basic-multi-select"
                    classNamePrefix="select"
                    placeholder={placeholder}
                    defaultValue={defaultValue}
                    value={value}
                    isMulti={isMulti}
                    name="colors"
                    onChange={onChange}
                    onMenuClose={onMenuClose}
                    onMenuOpen={onMenuOpen}
                    options={options}
                    ref={parentRef}
                    styles={selectFilterStyle}
                    noOptionsMessage={() => { return t('All options already selected');}}
                />
            </ConditionalWrapper>
        </ConditionalWrapper>
    );
}

function SelectItemFilter({
    placeholder,
    defaultValue,
    value,
    selection,
    onChange,
    isMulti = false,
    label,
    tooltip,
    tooltipDisabled,
    onMenuOpen,
    onMenuClose,
    wide,
    items,
    showImage = true,
    shortNames,
    valueField = 'id',
}) {
    const [selectedItem, setSelectedItem] = useState(false);
    const selectInputRef = useRef(null);
    const { t } = useTranslation();

    const elements = [(
        <SelectFilter
            key={'select-item-filter'}
            placeholder={placeholder}
            label={label}
            options={items.map((item) => {
                return {
                    label: shortNames? item.shortName : item.name,
                    value: item[valueField],
                    selected: selection && selection.id === item.id
                };
            })}
            onChange={(event) => {
                if (!event) {
                    return true;
                }

                setSelectedItem(
                    items.find(
                        (item) => item.id === event.value,
                    ),
                );
                if (onChange) {
                    onChange(event);
                }
            }}
            parentRef={selectInputRef}
            wide={wide}
            defaultValue={defaultValue}
            value={value}
            isMulti={isMulti}
            tooltip={tooltip}
            tooltipDisabled={tooltipDisabled}
            onMenuOpen={onMenuOpen}
            onMenuClose={onMenuClose}
        />
    )];

    if (selectedItem && showImage) {
        elements.push((
            <Tippy
                content={t('Clear selection')}
            >
                <img
                    key={'select-item-filter-selected-icon'}
                    alt={`${selectedItem.name}-icon`}
                    onClick={() => {
                        selectInputRef.current?.clearValue();
                        setSelectedItem(false);
                        if (onChange) {
                            onChange({label: '', value: false});
                        }
                    }}
                    loading="lazy"
                    src={selectedItem.iconLink}
                    style={{cursor: 'pointer'}}
                />
            </Tippy>
        ))
    }
    return elements;
}

function InputFilter({
    defaultValue,
    value = undefined,
    type = 'text',
    placeholder,
    onChange,
    label,
    min,
    max,
    tooltip,
    inputMode,
}) {
    return (
        <ConditionalWrapper
            condition={tooltip}
            wrapper={(children) => {
                return (
                    <Tippy
                        placement="bottom"
                        content={tooltip}
                    >
                        {children}
                    </Tippy>
                );
            }}
        >
            <label className={'single-filter-wrapper'}>
                <span className={'single-filter-label'}>{label}</span>
                <input
                    className={`filter-input ${type}`}
                    defaultValue={defaultValue}
                    value={value}
                    type={type}
                    inputMode={inputMode}
                    placeholder={placeholder}
                    onChange={onChange}
                    min={min}
                    max={max}
                />
            </label>
        </ConditionalWrapper>
    );
}

function Filter({ center, children, fullWidth }) {
    const [showFilter, setShowFilter] = useState(false);
    const toggleButton = useRef();
    useEffect(() => {
        if (!toggleButton.current) {
            return;
        }
        const intersectionObserver = new IntersectionObserver(entries => {
            if (!toggleButton.current) {
                return;
            }
            if (!entries[0].isIntersecting && showFilter) {
                setShowFilter(false);
            }
        });
        intersectionObserver.observe(toggleButton.current);
        return () => intersectionObserver.disconnect();
    }, [showFilter]);
    return [
        <div
            className={`filter-toggle-icon-wrapper`}
            key="filter-toggle-icon"
            onClick={(e) => setShowFilter(!showFilter)}
            ref={toggleButton}
        >
            <Fab
                style={{ backgroundColor: '#9a8866' }}
                aria-label="add"
                key="filter-toggle-icon"
                onClick={(e) => setShowFilter(!showFilter)}
            >
                <Icon path={mdiTune} size={1} className="icon-with-text" />
            </Fab>
        </div>,
        <div
            className={`filter-wrapper${showFilter ? ' open' : ''}${
                center ? ' filter-wrapper-center' : ''
            }${fullWidth ? ' full-width' : ''}`}
            key="page-filter"
        >
            <div className={'filter-content-wrapper'}>
                {/* <div
                    className = {'text-label'}
                >
                    {`Prices updated: ${new Date().toLocaleDateString()}`}
                </div> */}
                {children}
            </div>
        </div>,
    ];
}

export {
    Filter,
    ToggleFilter,
    SelectFilter,
    InputFilter,
    SliderFilter,
    ButtonGroupFilter,
    ButtonGroupFilterButton,
    RangeFilter,
    SelectItemFilter,
};
