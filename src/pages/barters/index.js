import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import Icon from '@mdi/react';
import { mdiAccountSwitch } from '@mdi/js';

import BartersTable from '../../components/barters-table';
import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage';
import {
    Filter,
    InputFilter,
    ButtonGroupFilter,
    ButtonGroupFilterButton,
    ToggleFilter,
} from '../../components/filter';

import { selectAllTraders, fetchTraders } from '../../features/traders/tradersSlice';

import { toggleHideDogtagBarters } from '../../features/settings/settingsSlice';

import './index.css';

function Barters() {
    const defaultQuery = new URLSearchParams(window.location.search).get(
        'search',
    );
    const [nameFilter, setNameFilter] = useState(defaultQuery || '');
    const [selectedTrader, setSelectedTrader] = useStateWithLocalStorage(
        'selectedTrader',
        'all',
    );
    const [showAll, setShowAll] = useStateWithLocalStorage(
        'showAllBarters',
        false,
    );
    const hideDogtagBarters = useSelector((state) => state.settings.hideDogtagBarters);

    const dispatch = useDispatch();
    const allTraders = useSelector(selectAllTraders);
    const tradersStatus = useSelector((state) => {
        return state.traders.status;
    });
    useEffect(() => {
        let timer = false;
        if (tradersStatus === 'idle') {
            dispatch(fetchTraders());
        }

        if (!timer) {
            timer = setInterval(() => {
                dispatch(fetchTraders());
            }, 600000);
        }

        return () => {
            clearInterval(timer);
        };
    }, [tradersStatus, dispatch]);

    const { t } = useTranslation();

    const traders = useMemo(() => {
        return allTraders.filter(trader => trader.normalizedName !== 'fence');
    }, [allTraders]);

    return [
        <Helmet key={'barters-helmet'}>
            <meta charSet="utf-8" />
            <title>{t('Barter Profits')} - {t('Escape from Tarkov')} - {t('Tarkov.dev')}</title>
            <meta name="description" content={t('barters-page-description', 'This page includes information on the different items that can be traded with NPC vendors, the barter prices, and the profits that can be made from selling the items.')} />
        </Helmet>,
        <div className={'page-wrapper'} key="barters-page-wrapper">
            <div className="barters-headline-wrapper" key="barters-headline">
                <h1 className="barters-page-title">
                    <Icon path={mdiAccountSwitch} size={1.5} className="icon-with-text"/>
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
                                            src={`${process.env.PUBLIC_URL}/images/${trader.normalizedName}-icon.jpg`}
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
                    <InputFilter
                        defaultValue={nameFilter || ''}
                        label={t('Item filter')}
                        type={'text'}
                        placeholder={t('filter on item')}
                        onChange={(e) => setNameFilter(e.target.value)}
                    />
                </Filter>
            </div>

            <BartersTable
                nameFilter={nameFilter}
                selectedTrader={selectedTrader}
                key="barters-page-barters-table"
                showAll={showAll}
            />

            <div className="page-wrapper barters-page-wrapper">
                <p>
                    {"Except for Fence, every trader in Escape from Tarkov offers goods by barter rather than for purchase outright."}<br/>
                    <br/>
                    {"In exchange for a variety of inexpensive things, the player can frequently trade them for more valuable objects that can be utilized or sold for a profit or higher level gear at lower loyalty levels."}<br/>
                    <br/>
                    {"Be sure to check back after reset for your favorite transactions because the majority of these valued trades have strict limits per trader reset and frequently sell out."}
                </p>
            </div>
        </div>,
    ];
}

export default Barters;
