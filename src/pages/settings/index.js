import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation, withTranslation } from 'react-i18next';
import Select from 'react-select';

import i18n from '../../i18n.js';

import SEO from '../../components/SEO.jsx';
import { InputFilter, ToggleFilter } from '../../components/filter/index.js';
import StationSkillTraderSetting from '../../components/station-skill-trader-setting/index.js';
import CheekiBreekiEffect from '../../components/cheeki-breeki-effect/index.js';

import {
    //selectAllTraders as traderSettings,
    selectAllStations,
    toggleFlea,
    setMinDogtagLevel,
    selectAllSkills,
    setTarkovTrackerAPIKey,
    toggleTarkovTracker,
    toggleHideRemoteControl,
    toggleHideDogtagBarters,
    setGameMode,
    // selectCompletedQuests,
} from '../../features/settings/settingsSlice.js';
import useHideoutData from '../../features/hideout/index.js';
import useTradersData from '../../features/traders/index.js';

import supportedLanguages from '../../data/supported-languages.json';
import gameModes from '../../data/game-modes.json';

import { getWipeData } from '../wipe-length/index.js';

import './index.css';

// Defined Languages
/*const langOptions = [
    { value: 'en', label: 'en' },
    { value: 'de', label: 'de' },
    { value: 'ru', label: 'ru' },
    { value: 'it', label: 'it' },
    { value: 'es', label: 'es' },
    { value: 'fr', label: 'fr' },
    { value: 'ja', label: 'ja' },
    { value: 'pl', label: 'pl' },
]*/
const langOptions = supportedLanguages.map(lang => {
    return {value: lang, label: lang};
});

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
    //const allTraders = useSelector(traderSettings);
    const allStations = useSelector(selectAllStations);
    const allSkills = useSelector(selectAllSkills);
    const hasFlea = useSelector((state) => state.settings.hasFlea);
    const useTarkovTracker = useSelector(
        (state) => state.settings.useTarkovTracker,
    );
    const hideDogtagBarters = useSelector((state) => state.settings.hideDogtagBarters);
    const gameMode = useSelector((state) => state.settings.gameMode);

    const refs = {
        'bitcoin-farm': useRef(null),
        'booze-generator': useRef(null),
        'christmas-tree': useRef(null),
        'intelligence-center': useRef(null),
        'lavatory': useRef(null),
        'medstation': useRef(null),
        'nutrition-unit': useRef(null),
        'water-collector': useRef(null),
        'workbench': useRef(null),
        'solar-power': useRef(null),
    };

    const { data: allTraders } = useTradersData();

    const traders = useMemo(() => {
        return allTraders.filter(t => t.normalizedName !== 'lightkeeper' && t.normalizedName !== 'btr-driver');
    }, [allTraders]);

    const { data: hideout } = useHideoutData();
    
    const stations = useMemo(() => {
        return hideout.filter(s => s.crafts?.length || s.normalizedName === 'solar-power').sort((a, b) => {
            return a.name.localeCompare(b.name);
        });
    }, [hideout]);

    useEffect(() => {
        if (useTarkovTracker) {
            for (const stationKey in allStations) {
                if (!refs[stationKey]) {
                    continue;
                }

                refs[stationKey].current?.setValue({
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

    // Setup language selector
    const [language, setLanguage] = useState("id");
    const handleLangChange = event => {
        const lang = event.value;
        setLanguage(lang);
        i18n.changeLanguage(lang);
    };

    // cheeki breeki
    const [isShown, setIsShown] = useState(false);

    let audio = new Audio("/audio/killa.mp3")
    const handleClick = event => {
        if (!isShown) {
            audio.play();
            setIsShown(current => !current);
        }
    };
    audio.addEventListener("ended", (event) => {
        setIsShown(current => !current);
    });

    // end cheeki breeki

    const wipeLength = getWipeData()[0].lengthDays;
    const estimatedAvgPlayerLevel = Math.round(30 * Math.atan(wipeLength / 38));

    return (
        <SEO 
            title={`${t('Settings')} - ${t('Tarkov.dev')}`}
            description={t('settings-page-description', 'This page contains user settings on Tarkov.dev.')}
            key="seo-wrapper"
        />,
        <div className={'page-wrapper'}>
            <h1>{t('Settings')}</h1>
            <div className="language-toggle-wrapper settings-group-wrapper">
                <h2>{t('Language')}</h2>
                <Select
                    placeholder={i18n.language}
                    options={langOptions}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    onChange={(event) => {
                        handleLangChange({
                            target: language,
                            value: event.value,
                        })
                    }}
                />
            </div>
            <div className={'settings-group-wrapper'}>
                <h2>{t('General')}</h2>
                <label className={'single-filter-wrapper hidden'}>
                    <span className={'single-filter-label'}>{t('Game mode')}</span>
                    <Select
                        label={t('Game mode')}
                        placeholder={t(`game_mode_${gameMode}`)}
                        value={gameMode}
                        options={gameModes.map(m => {
                            return {
                                label: t(`game_mode_${m}`),
                                value: m,
                            }
                        })}
                        className="basic-multi-select game-mode"
                        classNamePrefix="select"
                        onChange={(event) => dispatch(setGameMode(event.value))}
                    />
                </label>
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
                        <a href="https://tarkovtracker.io/settings/" target="_blank" rel="noopener noreferrer">
                            {t('TarkovTracker API Token')}
                        </a>
                    }
                    defaultValue={useSelector(
                        (state) => state.settings.tarkovTrackerAPIKey,
                    )}
                    type="text"
                    placeholder={t('API Token')}
                    onChange={(event) => {
                        dispatch(setTarkovTrackerAPIKey(event.target.value));
                    }}
                />
            </div>
            <div className="settings-group-wrapper">
                <h2>{t('Traders')}</h2>
                {traders.map((trader) => {
                    return (
                        <StationSkillTraderSetting
                            key={trader.normalizedName}
                            label={trader.name}
                            type="trader"
                            stateKey={trader.normalizedName}
                            ref={refs[trader.normalizedName]}
                        />
                    );
                })}
            </div>
            <div className="settings-group-wrapper">
                <h2>{t('Stations')}</h2>
                {stations.map((station) => {
                    return (
                        <StationSkillTraderSetting
                            key={station.normalizedName}
                            label={station.name}
                            type="station"
                            stateKey={station.normalizedName}
                            ref={refs[station.normalizedName]}
                            isDisabled={useTarkovTracker}
                            image={station.imageLink}
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
                        />
                    );
                })}
            </div>
            <div className="settings-group-wrapper">
                <h2>{t('Dogtag Barters')}</h2>
                <ToggleFilter
                    checked={hideDogtagBarters}
                    label={t('Exclude')}
                    onChange={(e) => dispatch(toggleHideDogtagBarters(!hideDogtagBarters))}
                    tooltipContent={
                        <>
                            {t('The true "cost" of barters using Dogtags is difficult to estimate, so you may want to exclude dogtag barters')}
                        </>
                    }
                />
                <InputFilter
                    label={t('Minimum dogtag level')}
                    defaultValue={useSelector(
                        (state) => state.settings.minDogtagLevel,
                    )}
                    type="text"
                    inputMode="numeric"
                    placeholder={'1-72'}
                    onChange={(event) => {
                        if (!event.target.value) {
                            event.target.value = '1';
                        }
                        event.target.value = event.target.value.replaceAll(/[^0-9]/g, '');
                        if (!event.target.value) {
                            event.target.value = '1';
                        }
                        dispatch(setMinDogtagLevel(event.target.value));
                    }}
                    tooltip={(
                        <div>
                            <div>{t('Minimum dogtag level to use for calculating the cost of dogtag barter trades')}</div>
                            <div>{t(`The current estimated average player level is {{avgPlayerLevel}}`, {avgPlayerLevel: estimatedAvgPlayerLevel})}</div>
                        </div>
                    )}
                />
                <h2>{t('Miscellaneous')}</h2>
                <ToggleFilter
                    label={t('Hide remote control')}
                    onChange={handleHideRemoteValueToggle}
                    checked={hideRemoteControlValue}
                />
            </div>
            {/* cheeki breeki */}
            <div>
                <button className="cheeki-breeki-button" onClick={handleClick}>cheeki breeki</button>
                {isShown && (
                    <CheekiBreekiEffect />
                )}
            </div>
            {/* end cheeki breeki */}
        </div>
    );
}

export default withTranslation()(Settings);
