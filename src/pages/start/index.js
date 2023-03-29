import React, { useState, useCallback, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import QueueBrowserTask from '../../modules/queue-browser-task';

import categoryPages from '../../data/category-pages.json';

import SEO from '../../components/SEO';
import ItemIconList from '../../components/item-icon-list';
import LoadingSmall from '../../components/loading-small';

import { useMapImages } from '../../features/maps/queries';

import Icon from '@mdi/react';
import {
    mdiAccountGroup,
    mdiAmmunition,
    mdiHammerWrench,
    mdiFinance,
    mdiAccountSwitch,
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

const DISCORD_STASH_INVITE_LINK =
    'https://discord.com/api/oauth2/authorize?client_id=955521336904667227&permissions=309237664832&scope=bot%20applications.commands';

// Use Lazy and Suspense to load these components
const ServerStatus = lazy(() => import('../../components/server-status'));
const SmallItemTable = lazy(() => import('../../components/small-item-table'));
const ItemSearch = lazy(() => import('../../components/item-search'));
const BossList = lazy(() => import('../../components/boss-list'));

function Start() {
    const defaultQuery = new URLSearchParams(window.location.search).get('search');
    const [nameFilter, setNameFilter] = useState(defaultQuery || '');
    const { t } = useTranslation();

    const mapImages = useMapImages();
    const uniqueMaps = Object.values(mapImages);
    uniqueMaps.sort((a, b) => {
        if (a.normalizedName === 'openworld') return 1;
        if (b.normalizedName === 'openworld') return -1;
        return a.displayText.localeCompare(b.displayText);
    });

    const handleNameFilterChange = useCallback(
        (value) => {
            if (typeof window !== 'undefined') {
                // schedule this for the next loop so that the UI
                // has time to update but we do the filtering as soon as possible
                QueueBrowserTask.task(() => {
                    setNameFilter(value);
                });
            }
        },
        [setNameFilter],
    );

    const [loadMoreState, setLoadMoreState] = useState(false);
    const loadMore = (event) => {
        setLoadMoreState((current) => !current);
    };

    return [
        <SEO
            title={`${t('Tarkov.dev')} - ${t('Escape from Tarkov')}`}
            description={t(
                'start-page-description',
                'Checkout all information for items, crafts, barters, maps, loot tiers, hideout profits, trader details, a free API, and more with tarkov.dev! A free, community made, and open source ecosystem of Escape from Tarkov tools and guides.',
            )}
            type="website"
            key="seo-wrapper"
        />,
        <div
            className="display-wrapper page-wrapper start-wrapper"
            key={'display-wrapper-start-page'}
        >
            <div className="start-section-wrapper item-section" key={'item-section-div'}>
                <Suspense fallback={<LoadingSmall />} key={'item-search'}>
                    <ItemSearch
                        onChange={handleNameFilterChange}
                        autoFocus={true}
                        key={'item-search-box'}
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
                    {!loadMoreState && [
                        <div className="load-more-wrapper" key="start-load-more-button">
                            <button
                                id="load-more-button"
                                className="load-more-button"
                                onClick={loadMore}
                            >
                                {t('Load More')}
                            </button>
                        </div>,
                    ]}
                </Suspense>
            </div>
            <div className="start-section-wrapper" key={'sidebar-div'}>
                <Suspense fallback={<LoadingSmall />} key={'server-status'}>
                    <ServerStatus key={'server-status'} />
                </Suspense>
                <h3>
                    <Icon path={mdiHammerWrench} size={1} className="icon-with-text" />
                    {t('Tools')}
                </h3>
                <ul className="tools-list" key="tools-list">
                    <li key="start-link-ammo">
                        <Link to="/ammo/">
                            <Icon path={mdiAmmunition} size={1} className="icon-with-text" />
                            {t('Ammo chart filter')}
                        </Link>
                    </li>
                    <li key="start-link-barters">
                        <Link to="/barters/">
                            <Icon path={mdiAccountSwitch} size={1} className="icon-with-text" />
                            {t('Traders barter profit')}
                        </Link>
                    </li>
                    <li key="start-link-hideout-profit">
                        <Link to="/hideout-profit/">
                            <Icon path={mdiProgressWrench} size={1} className="icon-with-text" />
                            {t('Hideout crafts profit')}
                        </Link>
                    </li>
                    <li key="start-link-loot-tier">
                        <Link to="/loot-tier/">
                            <Icon path={mdiFinance} size={1} className="icon-with-text" />
                            {t('Loot tiers ranking')}
                        </Link>
                    </li>
                    <li key="start-link-hideout">
                        <Link to="/hideout">
                            <Icon path={mdiHome} size={1} className="icon-with-text" />
                            {t('Hideout build costs')}
                        </Link>
                    </li>
                    <li key="start-link-wipe-length">
                        <Link to="/wipe-length">
                            <Icon path={mdiCalendarClock} size={1} className="icon-with-text" />
                            {t('Average wipe length')}
                        </Link>
                    </li>
                    <li key="start-link-btc-farm-profit">
                        <Link to="/bitcoin-farm-calculator">
                            <Icon path={mdiBitcoin} size={1} className="icon-with-text" />
                            {t('Bitcoin farm profit')}
                        </Link>
                    </li>
                    <li key="start-link-stash-bot-invite">
                        <a href={DISCORD_STASH_INVITE_LINK}>
                            <Icon path={mdiDiscord} size={1} className="icon-with-text" />
                            {t('Invite Discord bot')}
                        </a>
                    </li>
                </ul>
                <h3>
                    <Link to={'/maps'} key={'maps-page'}>
                        <Icon path={mdiMap} size={1} className="icon-with-text" />
                        {t('Maps')}
                    </Link>
                </h3>
                <ul key="maps-list">
                    {uniqueMaps.map((map) => (
                        <li key={`map-link-${map.key}`}>
                            <Link to={`/map/${map.key}`}>{map.displayText}</Link>
                        </li>
                    ))}
                </ul>
                <h3>
                    <Link to={'/items'} key={'items-page'}>
                        <Icon path={mdiViewGrid} size={1} className="icon-with-text" />
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
                    <Link to={'/traders'} key={'traders-page'}>
                        <Icon path={mdiAccountGroup} size={1} className="icon-with-text" />
                        {t('Traders')}
                    </Link>
                </h3>
                <ul className="traders-list" key="traders-list">
                    <li key="start-link-prapor">
                        <Link to={`/trader/prapor`}>
                            <img
                                alt="Prapor icon"
                                className="trader-icon"
                                loading="lazy"
                                src={`${process.env.PUBLIC_URL}/images/traders/prapor-icon.jpg`}
                            />
                            {t('Prapor')}
                        </Link>
                    </li>
                    <li key="start-link-therapist">
                        <Link to={`/trader/therapist`}>
                            <img
                                alt="Therapist icon"
                                className="trader-icon"
                                loading="lazy"
                                src={`${process.env.PUBLIC_URL}/images/traders/therapist-icon.jpg`}
                            />
                            {t('Therapist')}
                        </Link>
                    </li>
                    <li key="start-link-skier">
                        <Link to={`/trader/skier`}>
                            <img
                                alt="Skier icon"
                                className="trader-icon"
                                loading="lazy"
                                src={`${process.env.PUBLIC_URL}/images/traders/skier-icon.jpg`}
                            />
                            {t('Skier')}
                        </Link>
                    </li>
                    <li key="start-link-peacekeeper">
                        <Link to={`/trader/peacekeeper`}>
                            <img
                                alt="Peacekeeper icon"
                                className="trader-icon"
                                loading="lazy"
                                src={`${process.env.PUBLIC_URL}/images/traders/peacekeeper-icon.jpg`}
                            />
                            {t('Peacekeeper')}
                        </Link>
                    </li>
                    <li key="start-link-mechanic">
                        <Link to={`/trader/mechanic`}>
                            <img
                                alt="Prapor icon"
                                className="trader-icon"
                                loading="lazy"
                                src={`${process.env.PUBLIC_URL}/images/traders/mechanic-icon.jpg`}
                            />
                            {t('Mechanic')}
                        </Link>
                    </li>
                    <li key="start-link-ragman">
                        <Link to={`/trader/ragman`}>
                            <img
                                alt="Ragman icon"
                                className="trader-icon"
                                loading="lazy"
                                src={`${process.env.PUBLIC_URL}/images/traders/ragman-icon.jpg`}
                            />
                            {t('Ragman')}
                        </Link>
                    </li>
                    <li key="start-link-jaeger">
                        <Link to={`/trader/jaeger`}>
                            <img
                                alt="Jaeger icon"
                                className="trader-icon"
                                loading="lazy"
                                src={`${process.env.PUBLIC_URL}/images/traders/jaeger-icon.jpg`}
                            />
                            {t('Jaeger')}
                        </Link>
                    </li>
                </ul>
                <h3>
                    <Link to={'/bosses'} key={'maps-page'}>
                        <Icon path={mdiEmoticonDevil} size={1} className="icon-with-text" />
                        {t('Bosses')}
                    </Link>
                </h3>
                <ul className="traders-list">
                    <Suspense fallback={<LoadingSmall />}>
                        <BossList />
                    </Suspense>
                </ul>
            </div>
            <div className="info-text-wrapper" key={'info-text-wrapper-div'}>
                <Link className="branding" to="/">
                    <img
                        alt="Tarkov.dev"
                        height={30}
                        width={186}
                        loading="lazy"
                        src={`${process.env.PUBLIC_URL}/tarkov-dev-logo.svg`}
                        className="main-logo"
                    />
                </Link>
                <h1 className="main-h1 main-headers">
                    {t('tarkov.dev is an open source tool kit for Escape from Tarkov.')}
                </h1>
                <h2 className="main-h2 main-headers">
                    {t(
                        'It is designed and maintained by the community to help you with quests, flea market trading, and improving your game! The API is also freely available for you to build your own tools and services related to EFT.',
                    )}
                </h2>
            </div>
        </div>,
    ];
}

export default Start;
