import { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import QueueBrowserTask from '../../modules/queue-browser-task';
import mapData from '../../data/maps.json';
import SmallItemTable from '../../components/small-item-table';
import ItemSearch from '../../components/item-search';
import ServerStatus from '../../components/server-status';
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
} from '@mdi/js';

import './index.css';

import categoryPages from '../../data/category-pages.json';

function Start(props) {
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

    return [
        <Helmet key={'loot-tier-helmet'}>
            <meta charSet="utf-8" />
            <title>{t(`Tarkov Tools - Escape from Tarkov`)}</title>
            <meta
                name="description"
                content={`All the relevant information about Escape from Tarkov`}
            />
        </Helmet>,
        <div
            className="display-wrapper page-wrapper start-wrapper"
            key={'display-wrapper'}
        >
            <div className="start-section-wrapper item-section">
                {/* <h3>
                    Items
                </h3> */}
                <ItemSearch
                    onChange={handleNameFilterChange}
                    autoFocus={true}
                />
                <SmallItemTable
                    maxItems={20}
                    nameFilter={nameFilter}
                    defaultRandom={true}
                    fleaValue
                    traderValue
                    instaProfit
                    hideBorders
                />
            </div>
            <div className="start-section-wrapper">
                {/* <h3>
                    Ammo types
                </h3>
                <ul>
                    {ammoTypes.map(ammoType => {
                        return <li>
                        </li>;
                    })}
                </ul> */}
                <ServerStatus />
                <Link className="ammo-link-wrapper" to={`/ammo/`}>
                    <h2>
                        <Icon
                            path={mdiAmmunition}
                            size={1}
                            rotate={90}
                            className="icon-with-text"
                        />
                        {t('Ammo chart')}
                    </h2>
                    <img
                        alt="Ammo chart"
                        className="link-image"
                        height="140"
                        loading="lazy"
                        src={`${process.env.PUBLIC_URL}/images/ammo-chart-thumbnail.jpg`}
                        width="256"
                    />
                </Link>
                <h3>
                    <Icon
                        path={mdiHammerWrench}
                        size={1}
                        className="icon-with-text"
                    />
                    {t('Tools')}
                </h3>
                <ul className="tools-list">
                    <li>
                        <Link to="/loot-tier/">
                            <Icon
                                path={mdiFinance}
                                size={1}
                                className="icon-with-text"
                            />
                            {t('Loot tiers')}
                        </Link>
                    </li>
                    <li>
                        <Link to="/barters/">
                            <Icon
                                path={mdiAccountSwitch}
                                size={1}
                                className="icon-with-text"
                            />
                            {t('Barter trades')}
                        </Link>
                    </li>
                    <li>
                        <Link to="/hideout-profit/">
                            <Icon
                                path={mdiProgressWrench}
                                size={1}
                                className="icon-with-text"
                            />
                            {t('Hideout crafts')}
                        </Link>
                    </li>
                    <li>
                        <a
                            href={
                                'https://discord.com/api/oauth2/authorize?client_id=925298399371231242&permissions=309237664832&scope=bot%20applications.commands'
                            }
                        >
                            <Icon
                                path={mdiDiscord}
                                size={1}
                                className="icon-with-text"
                            />
                            {t('Discord bot')}
                        </a>
                    </li>
                    <li>
                        <Link to="/hideout">
                            <Icon
                                path={mdiHome}
                                size={1}
                                className="icon-with-text"
                            />
                            {t('Hideout build costs')}
                        </Link>
                    </li>
                    <li>
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
                    <Link to={'/maps'}>
                        <Icon
                            path={mdiMap}
                            size={1}
                            className="icon-with-text"
                        />
                        {t('Maps')}
                    </Link>
                </h3>
                <ul>
                    {mapData.map((mapData) => {
                        return (
                            <li key={`map-link-${mapData.key}`}>
                                <Link to={`/map/${mapData.key}`}>
                                    {mapData.displayText}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
                <h3>
                    <Link to={'/items'}>
                        <Icon
                            path={mdiViewGrid}
                            size={1}
                            className="icon-with-text"
                        />
                        {t('Items')}
                    </Link>
                </h3>
                <ul>
                    {categoryPages.map((categoryPage) => {
                        return (
                            <li key={`start-link-to-${categoryPage.key}`}>
                                <Link to={`/items/${categoryPage.key}`}>
                                    <Icon
                                        path={ItemIconList(categoryPage.icon)}
                                        size={1}
                                        className="icon-with-text"
                                    />
                                    {categoryPage.displayText}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
                <h3>
                    <Link to={'/traders'}>
                        <Icon
                            path={mdiAccountGroup}
                            size={1}
                            className="icon-with-text"
                        />
                        {t('Traders')}
                    </Link>
                </h3>
                <ul className="traders-list">
                    <li>
                        <Link to={`/traders/prapor`}>
                            <img
                                alt="Prapor icon"
                                className="trader-icon"
                                src={`${process.env.PUBLIC_URL}/images/prapor-icon.jpg`}
                            />
                            {t('Prapor')}
                        </Link>
                    </li>
                    <li>
                        <Link to={`/traders/therapist`}>
                            <img
                                alt="Therapist icon"
                                className="trader-icon"
                                src={`${process.env.PUBLIC_URL}/images/therapist-icon.jpg`}
                            />
                            {t('Therapist')}
                        </Link>
                    </li>
                    <li>
                        <Link to={`/traders/skier`}>
                            <img
                                alt="Skier icon"
                                className="trader-icon"
                                src={`${process.env.PUBLIC_URL}/images/skier-icon.jpg`}
                            />
                            {t('Skier')}
                        </Link>
                    </li>
                    <li>
                        <Link to={`/traders/peacekeeper`}>
                            <img
                                alt="Peacekeeper icon"
                                className="trader-icon"
                                src={`${process.env.PUBLIC_URL}/images/peacekeeper-icon.jpg`}
                            />
                            {t('Peacekeeper')}
                        </Link>
                    </li>
                    <li>
                        <Link to={`/traders/mechanic`}>
                            <img
                                alt="Prapor icon"
                                className="trader-icon"
                                src={`${process.env.PUBLIC_URL}/images/mechanic-icon.jpg`}
                            />
                            {t('Mechanic')}
                        </Link>
                    </li>
                    <li>
                        <Link to={`/traders/ragman`}>
                            <img
                                alt="Ragman icon"
                                className="trader-icon"
                                src={`${process.env.PUBLIC_URL}/images/ragman-icon.jpg`}
                            />
                            {t('Ragman')}
                        </Link>
                    </li>
                    <li>
                        <Link to={`/traders/jaeger`}>
                            <img
                                alt="Jaeger icon"
                                className="trader-icon"
                                src={`${process.env.PUBLIC_URL}/images/jaeger-icon.jpg`}
                            />
                            {t('Jaeger')}
                        </Link>
                    </li>
                </ul>
            </div>
        </div>,
    ];
}

export default Start;
