import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { Trans, useTranslation } from 'react-i18next';

import { Icon } from '@mdi/react';
import { mdiCached, mdiProgressWrench } from '@mdi/js';

import SEO from '../../components/SEO.jsx';
import BartersTable from '../../components/barters-table/index.js';
import {
    Filter,
    InputFilter,
    ButtonGroupFilter,
    ButtonGroupFilterButton,
    ToggleFilter,
} from '../../components/filter/index.js';

import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage.jsx';

import useTradersData from '../../features/traders/index.js';
import { toggleHideDogtagBarters } from '../../features/settings/settingsSlice.js';

import './index.css';

function Barters() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [nameFilter, setNameFilter] = useState(searchParams.get('search') || '');
    const [selectedTrader, setSelectedTrader] = useStateWithLocalStorage(
        'selectedTrader',
        'all',
    );
    const [showAll, setShowAll] = useStateWithLocalStorage(
        'showAllBarters',
        false,
    );
    const [includeBarterIngredients, setIncludeBarterIngredients] = useStateWithLocalStorage(
        'includeBarterIngredients',
        true,
    );
    const [includeCraftIngredients, setIncludeCraftIngredients] = useStateWithLocalStorage(
        'includeCraftIngredients',
        false,
    );
    const hideDogtagBarters = useSelector((state) => state.settings.hideDogtagBarters);

    const dispatch = useDispatch();
    const { data: allTraders } = useTradersData();

    const { t } = useTranslation();

    useEffect(() => {
        setNameFilter(searchParams.get('search') || '');
    }, [searchParams]);

    const traders = useMemo(() => {
        return allTraders.filter(trader => trader.barters?.length);
    }, [allTraders]);

    return [
        <SEO 
            title={`${t('Barter Profits')} - ${t('Escape from Tarkov')} - ${t('Tarkov.dev')}`}
            description={t('barters-page-description', 'This page includes information on the different items that can be traded with NPC vendors, the barter prices, and the profits that can be made from selling the items.')}
            key="seo-wrapper"
        />,
        <div className={'page-wrapper'} key="barters-page-wrapper">
            <div className="barters-headline-wrapper" key="barters-headline">
                <h1 className="barters-page-title">
                    <Icon path={mdiCached} size={1.5} className="icon-with-text"/>
                    {t('Barter Profits')}
                </h1>
                <Filter>
                    <ToggleFilter
                        checked={showAll}
                        label={t('Ignore settings')}
                        onChange={(e) => setShowAll(!showAll)}
                        tooltipContent={
                            <>
                                {t('Shows all barters regardless of your settings')}
                            </>
                        }
                    />
                    <ToggleFilter
                        checked={hideDogtagBarters}
                        label={t('Hide dogtags')}
                        onChange={(e) => dispatch(toggleHideDogtagBarters(!hideDogtagBarters))}
                        tooltipContent={
                            <>
                                {t('The true "cost" of barters using Dogtags is difficult to estimate, so you may want to exclude dogtag barters')}
                            </>
                        }
                    />
                    <ButtonGroupFilter>
                        {traders.map((trader) => {
                            return (
                                <ButtonGroupFilterButton
                                    key={`trader-tooltip-${trader.normalizedName}`}
                                    tooltipContent={
                                        <>
                                            {trader.name}
                                        </>
                                    }
                                    selected={trader.normalizedName === selectedTrader}
                                    content={
                                        <img
                                            alt={trader.name}
                                            loading="lazy"
                                            title={trader.name}
                                            src={`${process.env.PUBLIC_URL}/images/traders/${trader.normalizedName}-icon.jpg`}
                                        />
                                    }
                                    onClick={setSelectedTrader.bind(
                                        undefined,
                                        trader.normalizedName)}
                                />
                            );
                        })}
                        <ButtonGroupFilterButton
                            tooltipContent={
                                <>
                                    {t('Show all barters')}
                                </>
                            }
                            selected={selectedTrader === 'all'}
                            content={t('All')}
                            onClick={setSelectedTrader.bind(undefined, 'all')}
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
                    <InputFilter
                        defaultValue={nameFilter || ''}
                        label={t('Item filter')}
                        type={'text'}
                        placeholder={t('filter on item')}
                        onChange={(e) => {
                            setSearchParams({'search': e.target.value});
                        }}
                    />
                </Filter>
            </div>

            <BartersTable
                nameFilter={nameFilter}
                selectedTrader={selectedTrader}
                key="barters-page-barters-table"
                showAll={showAll}
                useBarterIngredients={includeBarterIngredients}
                useCraftIngredients={includeCraftIngredients}
            />

            <div className="page-wrapper barters-page-wrapper">
                <Trans i18nKey={'barters-page-p'}>
                    <p>
                        Except for Fence, every trader in Escape from Tarkov offers goods by barter rather than for purchase outright.
                    <p>
                    </p>
                        In exchange for a variety of inexpensive things, the player can frequently trade them for more valuable objects that can be utilized or sold for a profit or higher level gear at lower loyalty levels.
                    <p>
                    </p>
                        Be sure to check back after reset for your favorite transactions because the majority of these valued trades have strict limits per trader reset and frequently sell out.
                    </p>
                </Trans>
            </div>
        </div>,
    ];
}

export default Barters;
