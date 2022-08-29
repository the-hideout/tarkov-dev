import { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import React, { lazy, Suspense } from 'react';

import QueueBrowserTask from '../../modules/queue-browser-task';
import rawMapData from '../../data/maps.json';
import ItemIconList from '../../components/item-icon-list';

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
} from '@mdi/js';

import './index.css';

import categoryPages from '../../data/category-pages.json';

const DISCORD_STASH_INVITE_LINK = 'https://discord.com/api/oauth2/authorize?client_id=955521336904667227&permissions=309237664832&scope=bot%20applications.commands'

// Use Lazy and Suspense to load these components
const ServerStatus = lazy(() => import('../../components/server-status'));
const SmallItemTable = lazy(() => import('../../components/small-item-table'));
const ItemSearch = lazy(() => import('../../components/item-search'));
const BossList = lazy(() => import('../../components/boss-list'));

function Start() {
    const defaultQuery = new URLSearchParams(window.location.search).get(
        'search',
    );
    const [nameFilter, setNameFilter] = useState(defaultQuery || '');
    const { t } = useTranslation();

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
    const loadMore = event => {
        setLoadMoreState(current => !current);
    };

    return [
        <Helmet key={'start-page-helmet'}>
            <meta key={'start-page-charset'} charSet="utf-8" />
            <title key={'start-page-title'}>{t(`Tarkov.dev - Escape from Tarkov`)}</title>
            <meta
                name="description"
                content={`Checkout all information for items, crafts, barters, maps, loot tiers, hideout profits, trader details, a free API, and more with tarkov.dev! A free, community made, and open source ecosystem of Escape from Tarkov tools and guides.`}
                key={'start-page-description'}
            />
        </Helmet>,
        <div
            className="display-wrapper page-wrapper start-wrapper"
            key={'display-wrapper-start-page'}
        >
            <div className="start-section-wrapper item-section" key={'item-section-div'}>
                <Suspense fallback={<div>{t('Loading...')}</div>} key={'item-search'}>
                    <ItemSearch
                        onChange={handleNameFilterChange}
                        autoFocus={true}
                        key={'item-search-box'}
                    />
                </Suspense>
                <Suspense fallback={<div>{t('Loading...')}</div>}>
                    <SmallItemTable
                        maxItems={20}
                        nameFilter={nameFilter}
                        defaultRandom={true}
                        autoScroll={loadMoreState}
                        totalTraderPrice={true}
                        fleaValue
                        traderValue
                        instaProfit
                        hideBorders
                        key="start-items-table"
                    />
                    {!loadMoreState &&
                    [<div className="load-more-wrapper" key="start-load-more-button">
                        <button id="load-more-button" className="load-more-button" onClick={loadMore}>Load More</button>
                    </div>]
                    }
                </Suspense>
            </div>
            <div className="start-section-wrapper" key={'server-status-div'}>
                <Suspense fallback={<div>{t('Loading...')}</div>} key={'server-status'}>
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
                            {t('Ammo Chart')}
                        </Link>
                    </li>
                    <li key="start-link-loot-tier">
                        <Link to="/loot-tier/">
                            <Icon
                                path={mdiFinance}
                                size={1}
                                className="icon-with-text"
                            />
                            {t('Loot tiers')}
                        </Link>
                    </li>
                    <li key="start-link-barters">
                        <Link to="/barters/">
                            <Icon
                                path={mdiAccountSwitch}
                                size={1}
                                className="icon-with-text"
                            />
                            {t('Barter trades')}
                        </Link>
                    </li>
                    <li key="start-link-hideout-profit">
                        <Link to="/hideout-profit/">
                            <Icon
                                path={mdiProgressWrench}
                                size={1}
                                className="icon-with-text"
                            />
                            {t('Hideout crafts')}
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
                            {t('Discord bot')}
                        </a>
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
                            {t('Wipe length')}
                        </Link>
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
                    {rawMapData.map((mapsGroup) => (
                        mapsGroup.maps.map((map) => (
                            <li key={`map-link-${map.key}`}>
                                <Link to={`/map/${map.key}`}>
                                    {map.displayText}
                                </Link>
                            </li>
                        ))
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
                    <li key="start-link-prapor">
                        <Link to={`/traders/prapor`}>
                            <img
                                alt="Prapor icon"
                                className="trader-icon"
                                loading="lazy"
                                src={`${process.env.PUBLIC_URL}/images/prapor-icon.jpg`}
                            />
                            {t('Prapor')}
                        </Link>
                    </li>
                    <li key="start-link-therapist">
                        <Link to={`/traders/therapist`}>
                            <img
                                alt="Therapist icon"
                                className="trader-icon"
                                loading="lazy"
                                src={`${process.env.PUBLIC_URL}/images/therapist-icon.jpg`}
                            />
                            {t('Therapist')}
                        </Link>
                    </li>
                    <li key="start-link-skier">
                        <Link to={`/traders/skier`}>
                            <img
                                alt="Skier icon"
                                className="trader-icon"
                                loading="lazy"
                                src={`${process.env.PUBLIC_URL}/images/skier-icon.jpg`}
                            />
                            {t('Skier')}
                        </Link>
                    </li>
                    <li key="start-link-peacekeeper">
                        <Link to={`/traders/peacekeeper`}>
                            <img
                                alt="Peacekeeper icon"
                                className="trader-icon"
                                loading="lazy"
                                src={`${process.env.PUBLIC_URL}/images/peacekeeper-icon.jpg`}
                            />
                            {t('Peacekeeper')}
                        </Link>
                    </li>
                    <li key="start-link-mechanic">
                        <Link to={`/traders/mechanic`}>
                            <img
                                alt="Prapor icon"
                                className="trader-icon"
                                loading="lazy"
                                src={`${process.env.PUBLIC_URL}/images/mechanic-icon.jpg`}
                            />
                            {t('Mechanic')}
                        </Link>
                    </li>
                    <li key="start-link-ragman">
                        <Link to={`/traders/ragman`}>
                            <img
                                alt="Ragman icon"
                                className="trader-icon"
                                loading="lazy"
                                src={`${process.env.PUBLIC_URL}/images/ragman-icon.jpg`}
                            />
                            {t('Ragman')}
                        </Link>
                    </li>
                    <li key="start-link-jaeger">
                        <Link to={`/traders/jaeger`}>
                            <img
                                alt="Jaeger icon"
                                className="trader-icon"
                                loading="lazy"
                                src={`${process.env.PUBLIC_URL}/images/jaeger-icon.jpg`}
                            />
                            {t('Jaeger')}
                        </Link>
                    </li>
                </ul>
                <h3>
                    <Link to={'/bosses'} key={"maps-page"}>
                        <Icon
                            path={mdiEmoticonDevil}
                            size={1}
                            className="icon-with-text"
                        />
                        {t('Bosses')}
                    </Link>
                </h3>
                <ul className="traders-list">
                    <Suspense fallback={<div>{t('Loading...')}</div>}>
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
                <h1 className='main-h1 main-headers'>tarkov.dev is an open source tool kit for Escape from Tarkov.</h1>
                <h2 className='main-h2 main-headers'>It is designed and maintained by the community to help you with quests, flea market trading, and improving your game! The API is also freely available for you to build your own tools and services related to EFT.</h2>
            </div>
        </div>,
    ];
}

export default Start;
