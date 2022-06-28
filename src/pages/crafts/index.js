import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

import CraftsTable from '../../components/crafts-table';
import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage';
import {
    Filter,
    InputFilter,
    ButtonGroupFilter,
    ButtonGroupFilterButton,
    ToggleFilter,
} from '../../components/filter';
import capitalizeTheFirstLetterOfEachWord from '../../modules/capitalize-first';

import Icon from '@mdi/react';
import { mdiProgressWrench } from '@mdi/js';

import './index.css';

const stations = [
    'booze-generator',
    // 'christmas-tree',
    'intelligence-center',
    'lavatory',
    'medstation',
    'nutrition-unit',
    'water-collector',
    'workbench',
];

function Crafts() {
    const defaultQuery = new URLSearchParams(window.location.search).get(
        'search',
    );
    const [nameFilter, setNameFilter] = useState(defaultQuery || '');
    const [freeFuel, setFreeFuel] = useState(false);
    const [selectedStation, setSelectedStation] = useStateWithLocalStorage(
        'selectedStation',
        'top',
    );
    const [showAll, setShowAll] = useState(false);
    const { t } = useTranslation();

    return [
        <Helmet key={'loot-tier-helmet'}>
            <meta charSet="utf-8" />
            <title>Hideout Craft Profits</title>
            <meta
                name="description"
                content="Escape from Tarkov Hideout Craft Profits"
            />
        </Helmet>,
        <div className="crafts-headline-wrapper" key="crafts-filters">
            <h1 className="crafts-page-title">
                <Icon
                    path={mdiProgressWrench}
                    size={1.5}
                    className="icon-with-text"
                />
                {t('Hideout Crafts')}
            </h1>
            <Filter>
                <ToggleFilter
                    checked={showAll}
                    label={t('Ignore settings')}
                    onChange={(e) => setShowAll(!showAll)}
                    tooltipContent={
                        <div>
                            {t(
                                'Shows all crafts regardless of what you have set in your settings',
                            )}
                        </div>
                    }
                />
                <ButtonGroupFilter>
                    {stations.map((stationName) => {
                        return (
                            <ButtonGroupFilterButton
                                key={`station-tooltip-${stationName}`}
                                tooltipContent={
                                    <div>
                                        {capitalizeTheFirstLetterOfEachWord(
                                            stationName.replace('-', ' '),
                                        )}
                                    </div>
                                }
                                selected={stationName === selectedStation}
                                content={
                                    <img
                                        alt={stationName}
                                        loading="lazy"
                                        title={stationName}
                                        src={`${process.env.PUBLIC_URL}/images/${stationName}-icon.png`}
                                    />
                                }
                                onClick={setSelectedStation.bind(
                                    undefined,
                                    stationName,
                                )}
                            />
                        );
                    })}
                    <ButtonGroupFilterButton
                        tooltipContent={
                            <div>
                                {t('Most profitable craft in each station')}
                            </div>
                        }
                        selected={selectedStation === 'top'}
                        content={t('Best')}
                        onClick={setSelectedStation.bind(undefined, 'top')}
                    />
                </ButtonGroupFilter>
                <ToggleFilter
                    checked={freeFuel}
                    label={t('Empty fuel')}
                    onChange={(e) => setFreeFuel(!freeFuel)}
                    tooltipContent={
                        <div>
                            {t(
                                "Sets fuel canister cost to 0 for crafts requiring fuel canisters when using non-FIR fuel canisters from generator.",
                            )}
                        </div>
                    }
                />
                <InputFilter
                    defaultValue={nameFilter || ''}
                    label={t('Item filter')}
                    type={'text'}
                    placeholder={'filter on item'}
                    onChange={(e) => setNameFilter(e.target.value)}
                />
            </Filter>
        </div>,
        <CraftsTable
            nameFilter={nameFilter}
            freeFuel={freeFuel}
            showAll={showAll}
            selectedStation={selectedStation}
            key="crafts-page-crafts-table"
        />,
    ];
}

export default Crafts;
