import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import Switch from 'react-switch';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // optional

import {
    selectAllTraders,
    selectAllStations,
    toggleFlea,
    setStationOrTraderLevel,
    selectAllSkills,
} from '../../features/settings/settingsSlice';
import capitalizeFirst from '../../modules/capitalize-first';
import camelcaseToDashes from '../../modules/camelcase-to-dashes';

import './index.css';

function Settings() {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const allTraders = useSelector(selectAllTraders);
    const allStations = useSelector(selectAllStations);
    const allSkills = useSelector(selectAllSkills);
    const hasFlea = useSelector((state) => state.settings.hasFlea);

    return <div
        className = {'page-wrapper'}
    >
        <h1>
            {t('Settings')}
        </h1>
        <div
            className = {'settings-group-wrapper'}
        >
            <div
                className = 'toggle-wrapper'
            >
                <span
                    className = 'toggle-label'
                >
                    {t('Has flea')}
                </span>
                <Switch
                    onChange = {() => dispatch(toggleFlea(!hasFlea))}
                    checked = {hasFlea}
                />
            </div>
        </div>
        <div
            className = 'settings-group-wrapper'
        >
            <h2>
                {t('Traders')}
            </h2>
            {Object.keys(allTraders).map((traderKey) => {
                let selectOptions = [
                    {
                        value: 1,
                        label: '1',
                    },
                    {
                        value: 2,
                        label: '2',
                    },
                    {
                        value: 3,
                        label: '3',
                    },
                    {
                        value: 4,
                        label: '4',
                    },
                ];

                if(traderKey === 'jaeger'){
                    selectOptions.unshift({
                        value: 0,
                        label: 'Locked',
                    });
                }

                if(traderKey === 'fence'){
                    selectOptions.unshift({
                        value: 0,
                        label: '0',
                    });
                    selectOptions = [...selectOptions.slice(0,2)]
                }

                const selectedOption = selectOptions.find((selectOption) => {
                    return selectOption.value === allTraders[traderKey];
                });

                return <Tippy
                    key = {`${traderKey}-level`}
                    placement = 'top'
                    content = {capitalizeFirst(traderKey)}
                >
                    <div
                        className = 'trader-level-wrapper'
                    >
                        <img
                            alt = {`${traderKey}-icon`}
                            src = {`${process.env.PUBLIC_URL}/images/${traderKey}-icon.jpg`}
                        />
                        <Select
                            defaultValue = {selectedOption}
                            name = "colors"
                            options = {selectOptions}
                            className = "basic-multi-select"
                            onChange = {(event) => {
                                dispatch(setStationOrTraderLevel({
                                    target: traderKey,
                                    value: event.value,
                                }))
                            }}
                            classNamePrefix = "select"
                        />
                    </div>
                </Tippy>
            })}
        </div>
        <div
            className = 'settings-group-wrapper'
        >
            <h2>
                {t('Stations')}
            </h2>
            {Object.keys(allStations).map((stationKey) => {
                let selectOptions = [
                    {
                        value: 0,
                        label: 'Not built'
                    },
                    {
                        value: 1,
                        label: '1'
                    },
                    {
                        value: 2,
                        label: '2',
                    },
                    {
                        value: 3,
                        label: '3',
                    },
                ];

                if(stationKey === 'booze-generator'){
                    selectOptions = [...selectOptions.slice(0, 2)];
                }

                return <Tippy
                    placement = 'top'
                    key = {`${stationKey}-level`}
                    content = {capitalizeFirst(camelcaseToDashes(stationKey).replace(/-/g, ' '))}
                >
                    <div
                        className = 'trader-level-wrapper'
                    >
                        <img
                            alt = {`${stationKey}-icon`}
                            src = {`${process.env.PUBLIC_URL}/images/${camelcaseToDashes(stationKey)}-icon.png`}
                        />
                        <Select
                            defaultValue = {selectOptions[allStations[stationKey]]}
                            name = "colors"
                            options = {selectOptions}
                            className = "basic-multi-select"
                            onChange = {(event) => {
                                dispatch(setStationOrTraderLevel({
                                    target: stationKey,
                                    value: event.value,
                                }))
                            }}
                            classNamePrefix = "select"
                        />
                </div>
                </Tippy>
            })}
        </div>
        <div
            className = 'settings-group-wrapper'
        >
            <h2>
                {t('Skills')}
            </h2>
            {Object.keys(allSkills).map((skillKey) => {
                let selectOptions = [
                    {
                        value: 0,
                        label: '0'
                    },
                    {
                        value: 1,
                        label: '1'
                    },
                    {
                        value: 2,
                        label: '2'
                    },
                    {
                        value: 3,
                        label: '3'
                    },
                    {
                        value: 4,
                        label: '4'
                    },
                    {
                        value: 5,
                        label: '5'
                    },
                    {
                        value: 6,
                        label: '6'
                    },
                    {
                        value: 7,
                        label: '7'
                    },
                    {
                        value: 8,
                        label: '8'
                    },
                    {
                        value: 9,
                        label: '9'
                    },
                    {
                        value: 10,
                        label: '10'
                    },
                    {
                        value: 11,
                        label: '11'
                    },
                    {
                        value: 12,
                        label: '12'
                    },
                    {
                        value: 13,
                        label: '13'
                    },
                    {
                        value: 14,
                        label: '14'
                    },
                    {
                        value: 15,
                        label: '15'
                    },
                    {
                        value: 16,
                        label: '16'
                    },
                    {
                        value: 17,
                        label: '17'
                    },
                    {
                        value: 18,
                        label: '18'
                    },
                    {
                        value: 19,
                        label: '19'
                    },
                    {
                        value: 20,
                        label: '20'
                    },
                    {
                        value: 21,
                        label: '21'
                    },
                    {
                        value: 22,
                        label: '22'
                    },
                    {
                        value: 23,
                        label: '23'
                    },
                    {
                        value: 24,
                        label: '24'
                    },
                    {
                        value: 25,
                        label: '25'
                    },
                    {
                        value: 26,
                        label: '26'
                    },
                    {
                        value: 27,
                        label: '27'
                    },
                    {
                        value: 28,
                        label: '28'
                    },
                    {
                        value: 29,
                        label: '29'
                    },
                    {
                        value: 30,
                        label: '30'
                    },
                    {
                        value: 31,
                        label: '31'
                    },
                    {
                        value: 32,
                        label: '32'
                    },
                    {
                        value: 33,
                        label: '33'
                    },
                    {
                        value: 34,
                        label: '34'
                    },
                    {
                        value: 35,
                        label: '35'
                    },
                    {
                        value: 36,
                        label: '36'
                    },
                    {
                        value: 37,
                        label: '37'
                    },
                    {
                        value: 38,
                        label: '38'
                    },
                    {
                        value: 39,
                        label: '39'
                    },
                    {
                        value: 40,
                        label: '40'
                    },
                    {
                        value: 41,
                        label: '41'
                    },
                    {
                        value: 42,
                        label: '42'
                    },
                    {
                        value: 43,
                        label: '43'
                    },
                    {
                        value: 44,
                        label: '44'
                    },
                    {
                        value: 45,
                        label: '45'
                    },
                    {
                        value: 46,
                        label: '46'
                    },
                    {
                        value: 47,
                        label: '47'
                    },
                    {
                        value: 48,
                        label: '48'
                    },
                    {
                        value: 49,
                        label: '49'
                    },
                    {
                        value: 50,
                        label: '50'
                    },
                    {
                        value: 51,
                        label: '51'
                    },
                ];

                return <Tippy
                    placement = 'top'
                    key = {`${skillKey}-level`}
                    content = {capitalizeFirst(camelcaseToDashes(skillKey).replace(/-/g, ' '))}
                >
                    <div
                        className = 'trader-level-wrapper'
                    >
                        <img
                            alt = {`${skillKey}-icon`}
                            src = {`${process.env.PUBLIC_URL}/images/${camelcaseToDashes(skillKey)}-icon.png`}
                        />
                        <Select
                            defaultValue = {selectOptions[allSkills[skillKey]]}
                            name = "colors"
                            options = {selectOptions}
                            className = "basic-multi-select"
                            onChange = {(event) => {
                                dispatch(setStationOrTraderLevel({
                                    target: skillKey,
                                    value: event.value,
                                }))
                            }}
                            classNamePrefix = "select"
                        />
                </div>
                </Tippy>
            })}
        </div>
    </div>;
};

export default Settings;
