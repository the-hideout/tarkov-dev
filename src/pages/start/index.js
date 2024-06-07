import React, { useState, useCallback, useEffect, lazy, Suspense, useMemo } from 'react';
import { useSearchParams } from "react-router-dom";
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { useTranslation } from 'react-i18next';

import QueueBrowserTask from '../../modules/queue-browser-task.js';

import categoryPages from '../../data/category-pages.json';

import SEO from '../../components/SEO.jsx';
import ItemIconList from '../../components/item-icon-list/index.js';
import LoadingSmall from '../../components/loading-small/index.js';

import { mapIcons, useMapImagesSortedArray } from '../../features/maps/index.js';
import useTradersData from '../../features/traders/index.js';

import { Icon } from '@mdi/react';
import {
    mdiAccountGroup,
    mdiAmmunition,
    mdiHammerWrench,
    mdiFinance,
    mdiCached,
    mdiProgressWrench,
    mdiMap,
    mdiViewGrid,
    mdiDiscord,
    mdiHome,
    mdiCalendarClock,
    mdiEmoticonDevil,
    mdiBitcoin,
} from '@mdi/js';

import './index.css';

const DISCORD_STASH_INVITE_LINK = 'https://discord.com/api/oauth2/authorize?client_id=955521336904667227&permissions=309237664832&scope=bot%20applications.commands'

// Use Lazy and Suspense to load these components
const ServerStatus = lazy(() => import('../../components/server-status/index.js'));
const SmallItemTable = lazy(() => import('../../components/small-item-table/index.js'));
const ItemSearch = lazy(() => import('../../components/item-search/index.js'));
const BossList = lazy(() => import('../../components/boss-list/index.js'));

function Start() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [nameFilter, setNameFilter] = useState(searchParams.get('search') || '');
    const { t } = useTranslation();

    const mapImagesSortedArray = useMapImagesSortedArray();
    const uniqueMaps = mapImagesSortedArray.reduce((maps, current) => {
        if (!maps.some(storedMap => storedMap.normalizedName === current.normalizedName)) {
            maps.push({
                name: current.name,
                normalizedName: current.normalizedName,
                description: current.description,
            });
        }
        return maps;
    }, []);

    const { data: allTraders } = useTradersData();

    const traders = useMemo(() => {
        return allTraders.filter(t => t.barters?.length > 0)
    }, [allTraders]);

    useEffect(() => {
        setNameFilter(searchParams.get('search') || '');
    }, [searchParams]);

    const handleNameFilterChange = useCallback(
        (value) => {
            if (typeof window !== 'undefined') {
                // schedule this for the next loop so that the UI
                // has time to update but we do the filtering as soon as possible
                QueueBrowserTask.task(() => {
                    setSearchParams({'search': value});
                });
            }
        },
        [setSearchParams],
    );

    const [loadMoreState, setLoadMoreState] = useState(false);
    const loadMore = event => {
        setLoadMoreState(current => !current);
    };

    return [
        <SEO 
            title={`${t('Tarkov.dev')} - ${t('Escape from Tarkov')}`}
            description={t('start-page-description', 'Checkout all information for items, crafts, barters, maps, loot tiers, hideout profits, trader details, a free API, and more with tarkov.dev! A free, community made, and open source ecosystem of Escape from Tarkov tools and guides.')}
            type='website'
            key="seo-wrapper"
        />,
        <div
            className="display-wrapper page-wrapper start-wrapper"
            key={'display-wrapper-start-page'}
        >
            <div className="start-section-wrapper item-section" key={'item-section-div'}>
                <Suspense fallback={<LoadingSmall />} key={'item-search'}>
                    <ItemSearch
                        defaultValue={nameFilter}
                        onChange={handleNameFilterChange}
                        autoFocus={true}
                        key={'item-search-box'}
                        showSearchTypeSelector={false}
                    />
                </Suspense>
                <Suspense fallback={<LoadingSmall />}>
                    <SmallItemTable
                        maxItems={20}
                        nameFilter={nameFilter}
                        defaultRandom={true}
                        autoScroll={loadMoreState}
                        showSlotValue
                        fleaValue
                        traderValue={1}
                        instaProfit
                        hideBorders
                        key="start-items-table"
                    />
                    {!loadMoreState &&
                    [<div className="load-more-wrapper" key="start-load-more-button">
                        <button id="load-more-button" className="load-more-button" onClick={loadMore}>{t('Load More')}</button>
                    </div>]
                    }
                </Suspense>
            </div>
            <div className="start-section-wrapper" key={'sidebar-div'}>
                <Suspense fallback={<LoadingSmall />} key={'server-status'}>
                    <ServerStatus key={"server-status"} />
                </Suspense>
                <h3>
                    <Icon
                        path={mdiHammerWrench}
                        size={1}
                        className="icon-with-text"
                    />
                    {t('Tools')}
                </h3>
                <ul className="tools-list" key="tools-list">
                    <li key="start-link-ammo">
                        <Link to="/ammo/">
                            <Icon
                                path={mdiAmmunition}
                                size={1}
                                className="icon-with-text"
                            />
                            {t('Ammo chart filter')}
                        </Link>
                    </li>
                    <li key="start-link-barters">
                        <Link to="/barters/">
                            <Icon
                                path={mdiCached}
                                size={1}
                                className="icon-with-text"
                            />
                            {t('Traders barter profit')}
                        </Link>
                    </li>
                    <li key="start-link-hideout-profit">
                        <Link to="/hideout-profit/">
                            <Icon
                                path={mdiProgressWrench}
                                size={1}
                                className="icon-with-text"
                            />
                            {t('Hideout crafts profit')}
                        </Link>
                    </li>
                    <li key="start-link-loot-tier">
                        <Link to="/loot-tier/">
                            <Icon
                                path={mdiFinance}
                                size={1}
                                className="icon-with-text"
                            />
                            {t('Loot tiers ranking')}
                        </Link>
                    </li>
                    <li key="start-link-hideout">
                        <Link to="/hideout">
                            <Icon
                                path={mdiHome}
                                size={1}
                                className="icon-with-text"
                            />
                            {t('Hideout build costs')}
                        </Link>
                    </li>
                    <li key="start-link-wipe-length">
                        <Link to="/wipe-length">
                            <Icon
                                path={mdiCalendarClock}
                                size={1}
                                className="icon-with-text"
                            />
                            {t('Average wipe length')}
                        </Link>
                    </li>
                    <li key="start-link-btc-farm-profit">
                        <Link to="/bitcoin-farm-calculator">
                            <Icon
                                path={mdiBitcoin}
                                size={1}
                                className="icon-with-text"
                            />
                            {t('Bitcoin farm profit')}
                        </Link>
                    </li>
                    <li key="start-link-stash-bot-invite">
                        <a
                            href={DISCORD_STASH_INVITE_LINK}
                        >
                            <Icon
                                path={mdiDiscord}
                                size={1}
                                className="icon-with-text"
                            />
                            {t('Invite Discord bot')}
                        </a>
                    </li>
                </ul>
                <h3>
                    <Link to={'/maps'} key={"maps-page"}>
                        <Icon
                            path={mdiMap}
                            size={1}
                            className="icon-with-text"
                        />
                        {t('Maps')}
                    </Link>
                </h3>
                <ul key="maps-list">
                    {uniqueMaps.map((map) => (
                        <li key={`map-link-${map.normalizedName}`}>
                            <HashLink to={`/maps#${map.normalizedName}`}>
                                <Icon 
                                    path={mapIcons[map.normalizedName]} 
                                    size={1}
                                    className="icon-with-text"
                                />
                                {map.name}
                            </HashLink>
                        </li>
                    ))}
                </ul>
                <h3>
                    <Link to={'/items'} key={"items-page"}>
                        <Icon
                            path={mdiViewGrid}
                            size={1}
                            className="icon-with-text"
                        />
                        {t('Items')}
                    </Link>
                </h3>
                <ul key="categorys-list">
                    {categoryPages.map((categoryPage) => {
                        return (
                            <li key={`start-link-to-${categoryPage.key}`}>
                                <Link to={`/items/${categoryPage.key}`}>
                                    <Icon
                                        path={ItemIconList(categoryPage.icon)}
                                        size={1}
                                        className="icon-with-text"
                                    />
                                    {t(categoryPage.displayText)}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
                <h3>
                    <Link to={'/traders'} key={"traders-page"}>
                        <Icon
                            path={mdiAccountGroup}
                            size={1}
                            className="icon-with-text"
                        />
                        {t('Traders')}
                    </Link>
                </h3>
                <ul className="traders-list" key="traders-list">
                    {traders.map(trader => {
                        return (
                            <li key={`start-link-${trader.normalizedName}`}>
                                <Link to={`/trader/${trader.normalizedName}`}>
                                    <img
                                        alt={`${trader.name} icon`}
                                        className="trader-icon"
                                        loading="lazy"
                                        src={`${process.env.PUBLIC_URL}/images/traders/${trader.normalizedName}-icon.jpg`}
                                    />
                                    {trader.name}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
                <h3>
                    <Link to={'/bosses'} key={"bosses-page"}>
                        <Icon
                            path={mdiEmoticonDevil}
                            size={1}
                            className="icon-with-text"
                        />
                        {t('Bosses')}
                    </Link>
                </h3>
                <ul className="traders-list">
                    <Suspense fallback={<LoadingSmall />}>
                        <BossList />
                    </Suspense>
                </ul>
            </div>
            <div className='info-text-wrapper' key={'info-text-wrapper-div'}>
                <Link className="branding" to="/">
                    <img
                        alt="Tarkov.dev"
                        height={30}
                        width={186}
                        loading="lazy"
                        src={`${process.env.PUBLIC_URL}/tarkov-dev-logo.svg`}
                        className='main-logo'
                    />
                </Link>
                <h1 className='main-h1 main-headers'>{t('tarkov.dev is an open source tool kit for Escape from Tarkov.')}</h1>
                <h2 className='main-h2 main-headers'>{t('It is designed and maintained by the community to help you with quests, flea market trading, and improving your game! The API is also freely available for you to build your own tools and services related to EFT.')}</h2>
            </div>
        </div>,
    ];
}

export default Start;
