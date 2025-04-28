import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { Icon } from '@mdi/react';
import { mdiHome } from '@mdi/js';

import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage.jsx';

import SEO from '../../components/SEO.jsx';
import ItemsSummaryTable from '../../components/items-summary-table/index.js';
import {
    Filter,
    ButtonGroupFilter,
    ButtonGroupFilterButton,
    ToggleFilter,
} from '../../components/filter/index.js';

import useHideoutData from '../../features/hideout/index.js';

import './index.css';

function Hideout() {
    const [showBuilt, setShowBuilt] = useStateWithLocalStorage('showBuiltHideoutStations', true);
    const [showLocked, setShowLocked] = useStateWithLocalStorage('showLockedHideoutStations', true);
    const [showTraderStationReqs, setShowTraderStationReqs] = useStateWithLocalStorage('showTraderStationReqs', false);
    const [selectedStation, setSelectedStation] = useStateWithLocalStorage(
        'selectedHideoutStation',
        'all',
    );
    const { t } = useTranslation();
    const settings = useSelector((state) => state.settings[state.settings.gameMode]);

    const { data: hideout } = useHideoutData();

    const stations = useMemo(() => {
        return hideout.map(station => {
            return {
                ...station,
                levels: (showBuilt && showLocked) || !settings.useTarkovTracker ? station.levels : station.levels.filter(lvl => {
                    if (!showBuilt && lvl.level <= settings[station.normalizedName]) {
                        return false;
                    }
                    for (const req of lvl.stationLevelRequirements) {
                        if (!showLocked && req.level > settings[req.station.normalizedName]) {
                            return false;
                        }
                    }
                    for (const req of lvl.traderRequirements) {
                        if (!showLocked && req.level > settings[req.trader.normalizedName]) {
                            return false;
                        }
                    }
                    return true;
                }),
            };
        }).filter(station => station.levels.length > 0).sort((a, b) => {
            return a.name.localeCompare(b.name);
        });
    }, [hideout, settings, showBuilt, showLocked]);

    return [
        <SEO 
            title={`${t('Hideout')} - ${t('Escape from Tarkov')} - ${t('Tarkov.dev')}`}
            description={t('hideout-page-description', 'This page includes information on the different station and modules that can be build with the materials and resources required to upgrade your hideout.')}
            key="seo-wrapper"
        />,
        <div className="page-wrapper" key={'display-wrapper'}>
            <div className="page-headline-wrapper">
                <h1>
                    {t('Escape from Tarkov')}
                    <Icon path={mdiHome} size={1.5} className="icon-with-text"/>
                    {t('Hideout')}
                </h1>
            </div>
            <Filter center>
                <ButtonGroupFilter>
                    {stations.map((station) => {
                        return (
                            <ButtonGroupFilterButton
                                key={`station-tooltip-${station.normalizedName}`}
                                tooltipContent={
                                    <>
                                        {station.name}
                                    </>
                                }
                                selected={station.normalizedName === selectedStation}
                                content={
                                    <img
                                        alt={station.name}
                                        loading="lazy"
                                        src={station.imageLink}
                                    />
                                }
                                onClick={setSelectedStation.bind(
                                    undefined,
                                    station.normalizedName,
                                )}
                            />
                        );
                    })}
                    <ButtonGroupFilterButton
                        tooltipContent={
                            <>
                                {t('Show all stations & modules')}
                            </>
                        }
                        selected={selectedStation === 'all'}
                        content={t('All')}
                        onClick={setSelectedStation.bind(undefined, 'all')}
                    />
                </ButtonGroupFilter>
                {settings.useTarkovTracker && (<ToggleFilter
                    checked={showBuilt}
                    label={t('Show built')}
                    onChange={(e) =>
                        setShowBuilt(!showBuilt)
                    }
                    tooltipContent={
                        <>
                            {t('Show already built stations')}
                        </>
                    }
                />)}
                {settings.useTarkovTracker && (<ToggleFilter
                    checked={showLocked}
                    label={t('Show locked')}
                    onChange={(e) =>
                        setShowLocked(!showLocked)
                    }
                    tooltipContent={
                        <>
                            {t('Show unavailable stations')}
                        </>
                    }
                />)}
                <ToggleFilter
                    checked={showTraderStationReqs}
                    label={t('Show all requirements')}
                    onChange={(e) =>
                        setShowTraderStationReqs(!showTraderStationReqs)
                    }
                    tooltipContent={
                        <>
                            {t('Show trader and other station level requirements')}
                        </>
                    }
                />
            </Filter>
            {stations.map((hideoutModule) => {
                /*if (hideoutModule.name === 'Christmas Tree') {
                    return null;
                }*/

                if (
                    selectedStation &&
                    selectedStation !== 'all' &&
                    hideoutModule.normalizedName !==
                        selectedStation
                ) {
                    return null;
                }

                return hideoutModule.levels.map((level) => {
                    if (level.itemRequirements.length === 0) {
                        return null;
                    }

                    return (
                        <div
                            className="hideout-module-wrapper"
                            key={`hideout-module-cost-${hideoutModule.normalizedName}-${level.level}`}
                        >
                            <h2>
                                {hideoutModule.name} {level.level}
                            </h2>
                            <ItemsSummaryTable
                                includeItems={level.itemRequirements.map(
                                    (itemRequirement) => {
                                        return {
                                            ...itemRequirement.item,
                                            quantity: itemRequirement.quantity,
                                        };
                                    },
                                )}
                                includeTraders={showTraderStationReqs ? level.traderRequirements : []}
                                includeStations={showTraderStationReqs ? level.stationLevelRequirements.filter(req => req.station.id !== hideoutModule.id) : []}
                            />
                        </div>
                    );
                })
            })}
        </div>,
    ];
}

export default Hideout;
