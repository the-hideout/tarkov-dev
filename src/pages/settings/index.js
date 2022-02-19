import { useCallback, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { InputFilter, ToggleFilter } from '../../components/filter';
import StationSkillTraderSetting from '../../components/station-skill-trader-setting';
import {
    selectAllTraders,
    selectAllStations,
    toggleFlea,
    selectAllSkills,
    setTarkovTrackerAPIKey,
    fetchTarkovTrackerProgress,
    toggleTarkovTracker,
    toggleHideRemoteControl,
    // selectCompletedQuests,
} from '../../features/settings/settingsSlice';

import './index.css';

export function getNumericSelect(min, max) {
    let returnOptions = [];

    for (let i = min; i <= max; i = i + 1) {
        returnOptions.push({
            value: i,
            label: i.toString(),
        });
    }

    return returnOptions;
}

function Settings() {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const allTraders = useSelector(selectAllTraders);
    const allStations = useSelector(selectAllStations);
    const allSkills = useSelector(selectAllSkills);
    const hasFlea = useSelector((state) => state.settings.hasFlea);
    const useTarkovTracker = useSelector(
        (state) => state.settings.useTarkovTracker,
    );
    const progressStatus = useSelector((state) => {
        return state.settings.progressStatus;
    });
    // const completedQuests = useSelector(selectCompletedQuests);
    const tarkovTrackerAPIKey = useSelector(
        (state) => state.settings.tarkovTrackerAPIKey,
    );

    const refs = {
        'booze-generator': useRef(null),
        // 'christmas-tree': useRef(null),
        'intelligence-center': useRef(null),
        lavatory: useRef(null),
        medstation: useRef(null),
        'nutrition-unit': useRef(null),
        'water-collector': useRef(null),
        workbench: useRef(null),
        'solar-power': useRef(null),
    };

    useEffect(() => {
        let tarkovTrackerProgressInterval = false;
        if (useTarkovTracker && progressStatus === 'idle') {
            dispatch(fetchTarkovTrackerProgress(tarkovTrackerAPIKey));
        }

        if (!tarkovTrackerProgressInterval && useTarkovTracker) {
            tarkovTrackerProgressInterval = setInterval(() => {
                dispatch(fetchTarkovTrackerProgress(tarkovTrackerAPIKey));
            }, 30000);
        }

        if (tarkovTrackerProgressInterval && !useTarkovTracker) {
            clearInterval(tarkovTrackerProgressInterval);
        }

        return () => {
            clearInterval(tarkovTrackerProgressInterval);
        };
    }, [progressStatus, dispatch, tarkovTrackerAPIKey, useTarkovTracker]);

    useEffect(() => {
        if (useTarkovTracker) {
            for (const stationKey in allStations) {
                if (!refs[stationKey]) {
                    continue;
                }

                refs[stationKey].current.setValue({
                    value: allStations[stationKey],
                    label: allStations[stationKey]
                        ? allStations[stationKey].toString()
                        : t('Not built'),
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [useTarkovTracker, allStations]);

    const hideRemoteControlValue = useSelector(
        (state) => state.settings.hideRemoteControl,
    );
    const handleHideRemoteValueToggle = useCallback(() => {
        dispatch(toggleHideRemoteControl());
    }, [dispatch]);

    return (
        <div className={'page-wrapper'}>
            <h1>{t('Settings')}</h1>
            <div className={'settings-group-wrapper'}>
                <ToggleFilter
                    label={t('Has flea')}
                    onChange={() => dispatch(toggleFlea(!hasFlea))}
                    checked={hasFlea}
                    disabled={useTarkovTracker}
                />
                <ToggleFilter
                    label={t('Use TarkovTracker')}
                    onChange={() =>
                        dispatch(toggleTarkovTracker(!useTarkovTracker))
                    }
                    checked={useTarkovTracker}
                />
                <InputFilter
                    label={
                        <a href="https://tarkovtracker.io/settings/">
                            {t('TarkovTracker API Token')}
                        </a>
                    }
                    defaultValue={useSelector(
                        (state) => state.settings.tarkovTrackerAPIKey,
                    )}
                    type="text"
                    placeholder={t('TarkovTracker API Token')}
                    onChange={(event) => {
                        dispatch(setTarkovTrackerAPIKey(event.target.value));
                    }}
                />
            </div>
            <div className="settings-group-wrapper">
                <h2>{t('Traders')}</h2>
                {Object.keys(allTraders).map((traderKey) => {
                    return (
                        <StationSkillTraderSetting
                            key={traderKey}
                            type="trader"
                            stateKey={traderKey}
                            ref={refs[traderKey]}
                        />
                    );
                })}
            </div>
            <div className="settings-group-wrapper">
                <h2>{t('Stations')}</h2>
                {Object.keys(allStations).map((stationKey) => {
                    return (
                        <StationSkillTraderSetting
                            key={stationKey}
                            type="station"
                            stateKey={stationKey}
                            ref={refs[stationKey]}
                            isDisabled={useTarkovTracker}
                        />
                    );
                })}
            </div>
            <div className="settings-group-wrapper">
                <h2>{t('Skills')}</h2>
                {Object.keys(allSkills).map((skillKey) => {
                    return (
                        <StationSkillTraderSetting
                            key={skillKey}
                            type="skill"
                            stateKey={skillKey}
                            ref={refs[skillKey]}
                            isDisabled={useTarkovTracker}
                        />
                    );
                })}
            </div>
            <div className="settings-group-wrapper">
                <ToggleFilter
                    label={t('Hide remote control')}
                    onChange={handleHideRemoteValueToggle}
                    checked={hideRemoteControlValue}
                />
            </div>
        </div>
    );
}

export default Settings;
