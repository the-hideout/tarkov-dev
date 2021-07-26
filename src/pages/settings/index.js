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
} from '../../features/settings/settingsSlice';
import capitalizeFirst from '../../modules/capitalize-first';
import camelcaseToDashes from '../../modules/camelcase-to-dashes';

import './index.css';

function Settings() {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const allTraders = useSelector(selectAllTraders);
    const allStations = useSelector(selectAllStations);
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
                const selectOptions = [
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
                            defaultValue = {selectOptions[allTraders[traderKey] -1]}
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
                        label: '0'
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

                if(stationKey === 'boozeGenerator' || stationKey === 'waterCollector'){
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
    </div>;
};

export default Settings;
