import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Trans, useTranslation } from 'react-i18next';

import Icon from '@mdi/react';
import { mdiProgressWrench } from '@mdi/js';

import {
    selectAllCrafts,
    fetchCrafts,
} from '../../features/crafts/craftsSlice';

import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage';

import SEO from '../../components/SEO';
import CraftsTable from '../../components/crafts-table';
import {
    Filter,
    InputFilter,
    ButtonGroupFilter,
    ButtonGroupFilterButton,
    ToggleFilter,
} from '../../components/filter';

import './index.css';

function Crafts() {
    const defaultQuery = new URLSearchParams(window.location.search).get(
        'search',
    );
    const [nameFilter, setNameFilter] = useState(defaultQuery || '');
    const [freeFuel, setFreeFuel] = useState(false);
    const [averagePrices, setAveragePrices] = useStateWithLocalStorage(
        'averageCraftingPrices',
        true,
    );
    const [selectedStation, setSelectedStation] = useStateWithLocalStorage(
        'selectedStation',
        'top',
    );
    const [showAll, setShowAll] = useState(false);
    const { t } = useTranslation();

    const dispatch = useDispatch();
    const crafts = useSelector(selectAllCrafts);
    const craftsStatus = useSelector((state) => {
        return state.crafts.status;
    });

    useEffect(() => {
        let timer = false;
        if (craftsStatus === 'idle') {
            dispatch(fetchCrafts());
        }

        if (!timer) {
            timer = setInterval(() => {
                dispatch(fetchCrafts());
            }, 600000);
        }

        return () => {
            clearInterval(timer);
        };
    }, [craftsStatus, dispatch]);
    
    const stations = useMemo(() => {
        const stn = [];
        for (const craft of crafts) {
            if (craft.station.normalizedName === 'bitcoin-farm') {
                continue;
            }
            if (!stn.some(station => station.id === craft.station.id)) {
                stn.push(craft.station);
            }
        }
        return stn.sort((a, b) => {
            return a.name.localeCompare(b.name);
        });
    }, [crafts]);

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
                        onChange={(e) => setShowAll(!showAll)}
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
                                            src={`${process.env.PUBLIC_URL}/images/stations/${station.normalizedName}-icon.png`}
                                        />
                                    }
                                    onClick={setSelectedStation.bind(
                                        undefined,
                                        station.normalizedName)}
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
                            onClick={setSelectedStation.bind(undefined, 'top')}
                        />
                    </ButtonGroupFilter>
                    <ToggleFilter
                        checked={freeFuel}
                        label={t('Empty fuel')}
                        onChange={(e) => setFreeFuel(!freeFuel)}
                        tooltipContent={
                            <>
                                {t('Sets fuel canister cost to 0 for crafts requiring fuel canisters when using non-FIR fuel canisters.')}
                            </>
                        }
                    />
                    <InputFilter
                        defaultValue={nameFilter || ''}
                        label={t('Item filter')}
                        type={'text'}
                        placeholder={t('filter on item')}
                        onChange={(e) => setNameFilter(e.target.value)}
                    />
                </Filter>
            </div>

            <CraftsTable
                nameFilter={nameFilter}
                freeFuel={freeFuel}
                showAll={showAll}
                averagePrices={averagePrices}
                selectedStation={selectedStation}
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
