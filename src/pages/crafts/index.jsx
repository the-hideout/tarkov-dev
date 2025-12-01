import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';

import { Icon } from '@mdi/react';
import { mdiProgressWrench, mdiCancel, mdiCached } from '@mdi/js';

import useHideoutData from '../../features/hideout/index.js';

import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage.jsx';

import SEO from '../../components/SEO.jsx';
import CraftsTable from '../../components/crafts-table/index.jsx';
import {
    Filter,
    InputFilter,
    ButtonGroupFilter,
    ButtonGroupFilterButton,
    ToggleFilter,
} from '../../components/filter/index.jsx';

import './index.css';

function Crafts() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [nameFilter, setNameFilter] = useState(searchParams.get('search') ?? '');

    const [freeFuel, setFreeFuel] = useState(false);
    const [averagePrices, setAveragePrices] = useStateWithLocalStorage(
        'averageCraftingPrices',
        false,
    );
    const [selectedStation, setSelectedStation] = useStateWithLocalStorage(
        'selectedStation',
        searchParams.get('station') ?? 'top',
    );
    useEffect(() => {
        // set local storage value on initial page load
        if (!searchParams.get('station')) {
            return;
        }
        setSelectedStation(searchParams.get('station'));
    }, [searchParams, setSelectedStation]);
    const [includeBarterIngredients, setIncludeBarterIngredients] = useStateWithLocalStorage(
        'includeBarterIngredients',
        true,
    );
    const [includeCraftIngredients, setIncludeCraftIngredients] = useStateWithLocalStorage(
        'includeCraftIngredients',
        false,
    );
    const [showAll, setShowAll] = useState(searchParams.get('all') === 'true');
    const { t } = useTranslation();

    const setPathFilters = useCallback((filtervalues) => {
        const params = {
            all: showAll,
            station: selectedStation,
            search: nameFilter,
        };
        for (const paramName in filtervalues) {
            params[paramName] = filtervalues[paramName];
        }
        if (params.all !== 'true') {
            delete params.all;
        }
        if (params.station === 'top') {
            delete params.station;
        }
        if (params.search === '') {
            delete params.search;
        }
        setSearchParams(params, { replace: true });
    }, [setSearchParams, showAll, selectedStation, nameFilter]);

    const { data: hideout } = useHideoutData();
    
    const stations = useMemo(() => {
        return hideout.filter(s => s.crafts?.length && s.normalizedName !== 'bitcoin-farm').sort((a, b) => {
            return a.name.localeCompare(b.name);
        });
    }, [hideout]);

    return [
        <SEO 
            title={`${t('Hideout Crafts')} - ${t('Escape from Tarkov')} - ${t('Tarkov.dev')}`}
            description={t('crafts-page-description', 'This page includes information on the different items that can be crafted in the hideout, the materials and resources required, and the profits that can be made from selling the finished products.')}
            key="seo-wrapper"
        />,
        <div className="display-wrapper" key={'display-wrapper'}>
            <div className="crafts-headline-wrapper" key="crafts-filters">
                <h1 className="crafts-page-title">
                    <Icon path={mdiProgressWrench} size={1.5} className="icon-with-text"/>
                    {t('Hideout Crafts')}
                </h1>
                <Filter>
                    <ToggleFilter
                        checked={showAll}
                        label={t('Ignore settings')}
                        onChange={(e) => {
                            setShowAll(e);
                            setPathFilters({'all': `${e}`});
                        }}
                        tooltipContent={
                            <>
                                {t('Shows all crafts regardless of your settings')}
                            </>
                        }
                    />
                    <ToggleFilter
                        checked={averagePrices}
                        label={t('Average prices')}
                        onChange={(e) => setAveragePrices(!averagePrices)}
                        tooltipContent={
                            <>
                                {t('Use average prices from the past 24 hours for profit calculations')}
                            </>
                        }
                    />
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
                                    onClick={() => {
                                        setSelectedStation(station.normalizedName);
                                        setPathFilters({'station': station.normalizedName});
                                    }}
                                />
                            );
                        })}
                        <ButtonGroupFilterButton
                            tooltipContent={
                                <>
                                    {t('Most profitable craft in each station')}
                                </>
                            }
                            selected={selectedStation === 'top'}
                            content={t('Best')}
                            onClick={() => {
                                setSelectedStation('top');
                                setPathFilters({'station': 'top'});
                            }}
                        />
                        <ButtonGroupFilterButton
                            tooltipContent={
                                <>
                                    {t('Flea Market banned items')}
                                </>
                            }
                            selected={selectedStation === 'banned'}
                            content={<Icon path={mdiCancel} size={1} className="icon-with-text"/>}
                            onClick={() => {
                                setSelectedStation('banned');
                                setPathFilters({'station': 'banned'});
                            }}
                        />
                    </ButtonGroupFilter>
                    <ButtonGroupFilter>
                        <ButtonGroupFilterButton
                            tooltipContent={
                                <>
                                    {t('Use barters for item sources')}
                                </>
                            }
                            selected={includeBarterIngredients}
                            content={<Icon path={mdiCached} size={1} className="icon-with-text"/>}
                            onClick={setIncludeBarterIngredients.bind(undefined, !includeBarterIngredients)}
                        />
                        <ButtonGroupFilterButton
                            tooltipContent={
                                <>
                                    {t('Use crafts for item sources')}
                                </>
                            }
                            selected={includeCraftIngredients}
                            content={<Icon path={mdiProgressWrench} size={1} className="icon-with-text"/>}
                            onClick={setIncludeCraftIngredients.bind(undefined, !includeCraftIngredients)}
                        />
                    </ButtonGroupFilter>
                    <ToggleFilter
                        checked={freeFuel}
                        label={t('Empty fuel')}
                        onChange={(e) => setFreeFuel(!freeFuel)}
                        tooltipContent={
                            <>
                                {t('Sets fuel canister cost for crafts requiring them to vendors\' minimum sell price when using non-FIR fuel canisters.')}
                            </>
                        }
                    />
                    <InputFilter
                        value={nameFilter}
                        label={t('Item filter')}
                        type={'text'}
                        placeholder={t('filter on item')}
                        onChange={(e) => {
                            setNameFilter(e.target.value);
                            setPathFilters({'search': e.target.value});
                        }}
                    />
                </Filter>
            </div>

            <CraftsTable
                nameFilter={nameFilter}
                freeFuel={freeFuel}
                showAll={showAll}
                averagePrices={averagePrices}
                selectedStation={selectedStation}
                useBarterIngredients={includeBarterIngredients}
                useCraftIngredients={includeCraftIngredients}
                key="crafts-page-crafts-table"
            />

            <div className="page-wrapper crafts-page-wrapper">
                <Trans i18nKey={'crafts-page-p'}>
                    <p>
                        In Escape from Tarkov, crafts allow you create a variety of things. It is accomplished using a variety of hideout modules, including the water collector, workbench, medstation, lavatory, and nutrition unit.
                    </p>
                    <p>
                        The "Found in Raid" status will be applied to each item created in the hideout. The entire list of these crafts is shown above. The Crafting skill has an impact on item creation time.
                    </p>
                    <p>
                        When an item's icon has a blue border, it will be utilized as an auxiliary tool and, once manufacturing is finished, it will be returned to your stash.
                    </p>
                </Trans>
            </div>
        </div>
    ];
}

export default Crafts;
