import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';

import Icon from '@mdi/react';
import { mdiHome } from '@mdi/js';

import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage';
import ItemsSummaryTable from '../../components/items-summary-table';
import {
    selectAllHideoutModules,
    fetchHideout,
} from '../../features/hideout/hideoutSlice';
import {
    Filter,
    ButtonGroupFilter,
    ButtonGroupFilterButton,
} from '../../components/filter';

import './index.css';

function Hideout() {
    const [selectedStation, setSelectedStation] = useStateWithLocalStorage(
        'selectedHideoutStation',
        'all',
    );
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const hideout = useSelector(selectAllHideoutModules);
    const hideoutStatus = useSelector((state) => {
        return state.hideout.status;
    });

    useEffect(() => {
        let timer = false;
        if (hideoutStatus === 'idle') {
            dispatch(fetchHideout());
        }

        if (!timer) {
            timer = setInterval(() => {
                dispatch(fetchHideout());
            }, 600000);
        }

        return () => {
            clearInterval(timer);
        };
    }, [hideoutStatus, dispatch]);

    const stations = useMemo(() => {
        return hideout.map(station => station).sort((a, b) => {
            return a.name.localeCompare(b.name);
        });
    }, [hideout]);

    return [
        <Helmet key={'hideout-helmet'}>
            <meta charSet="utf-8" />
            <title>{t('Escape from Tarkov')} - {t('Hideout')}</title>
            <meta
                name="description"
                content={`All the relevant information about the Escape from Tarkov Hideout`}
            />
        </Helmet>,
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
                                        src={`${process.env.PUBLIC_URL}/images/${station.normalizedName}-icon.png`}
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
            </Filter>
            {hideout.map((hideoutModule) => {
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
                            />
                        </div>
                    );
                })
            })}
        </div>,
    ];
}

export default Hideout;
