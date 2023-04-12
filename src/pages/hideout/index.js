import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Icon from '@mdi/react';
import { mdiHome } from '@mdi/js';

import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage';

import SEO from '../../components/SEO';
import ItemsSummaryTable from '../../components/items-summary-table';
import {
    Filter,
    ButtonGroupFilter,
    ButtonGroupFilterButton,
} from '../../components/filter';

import { useHideoutData } from '../../features/hideout/hideoutSlice';

import './index.css';

function Hideout() {
    const [selectedStation, setSelectedStation] = useStateWithLocalStorage(
        'selectedHideoutStation',
        'all',
    );
    const { t } = useTranslation();
    const { data: hideout } = useHideoutData();

    const stations = useMemo(() => {
        return hideout.map(station => station).sort((a, b) => {
            return a.name.localeCompare(b.name);
        });
    }, [hideout]);

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
                                        src={`${process.env.PUBLIC_URL}/images/stations/${station.normalizedName}-icon.png`}
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
