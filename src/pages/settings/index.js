import { useEffect } from 'react';
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
    setTarkovTrackerAPIKey,
    fetchTarkovTrackerProgress,
    // selectCompletedQuests,
} from '../../features/settings/settingsSlice';
import capitalizeFirst from '../../modules/capitalize-first';
import camelcaseToDashes from '../../modules/camelcase-to-dashes';

import './index.css';

function getNumericSelect(min, max) {
    let returnOptions = [];

    for(let i = min; i <= max; i = i + 1){
        returnOptions.push({
            value: i,
            label: i.toString(),
        });
    }

    return returnOptions;
};

function Settings() {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const allTraders = useSelector(selectAllTraders);
    const allStations = useSelector(selectAllStations);
    const allSkills = useSelector(selectAllSkills);
    const hasFlea = useSelector((state) => state.settings.hasFlea);
    const progressStatus = useSelector((state) => {
        return state.settings.progressStatus;
    });
    // const completedQuests = useSelector(selectCompletedQuests);
    const tarkovTrackerAPIKey = useSelector((state) => state.settings.tarkovTrackerAPIKey);

    useEffect(() => {
        if (progressStatus === 'idle') {
          dispatch(fetchTarkovTrackerProgress(tarkovTrackerAPIKey));
        }
    }, [progressStatus, dispatch, tarkovTrackerAPIKey]);

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
                let selectOptions = getNumericSelect(1, 4);

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
                let selectOptions = getNumericSelect(0, 51);

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
        <div
            className = 'settings-group-wrapper'
        >
            <h2>
                {t('Load from TarkovTracker')}
            </h2>
            <label>
                {t('TarkovTracker API Token')}
            </label>
            <input
                defaultValue = {useSelector((state) => state.settings.tarkovTrackerAPIKey)}
                type = 'text'
                placeholder = {t('TarkovTracker API Token')}
                onChange = {(event) => {
                    dispatch(setTarkovTrackerAPIKey(event.target.value))
                }}
            />
            <a href="https://tarkovtracker.io/settings/">
                {t('Copy from tarkovtracker settings')}
            </a>
        </div>
    </div>;
};

export default Settings;
