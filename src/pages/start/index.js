import { useState, useCallback } from 'react';
import {Helmet} from 'react-helmet';
import {
    Link
} from "react-router-dom";

import QueueBrowserTask from '../../modules/queue-browser-task';
import mapData from '../../data/maps.json';
import SmallItemTable from '../../components/small-item-table';
import ItemSearch from '../../components/item-search';
import ServerStatus from '../../components/server-status';

import Icon from '@mdi/react';
import * as Icons from '@mdi/js';

import './index.css';

import categoryPages from '../../data/category-pages.json';

function Start(props) {
    const defaultQuery = new URLSearchParams(window.location.search).get('search');
    const [nameFilter, setNameFilter] = useState(defaultQuery || '');

    const handleNameFilterChange = useCallback((value) => {
        if (typeof window !== 'undefined') {
            // schedule this for the next loop so that the UI
            // has time to update but we do the filtering as soon as possible
            QueueBrowserTask.task(() => {
                setNameFilter(value);
            });
        }
    }, [setNameFilter]);

    return [
        <Helmet
            key = {'loot-tier-helmet'}
        >
            <meta charSet="utf-8" />
            <title>
                {`Tarkov Tools - Escape from Tarkov`}
            </title>
            <meta
                name="description"
                content= {`All the relevant information about Escape from Tarkov`}
            />
        </Helmet>,
        <div
            className="display-wrapper page-wrapper start-wrapper"
            key = {'display-wrapper'}
        >
            <div
                className = 'start-section-wrapper item-section'
            >
                {/* <h3>
                    Items
                </h3> */}
                <ItemSearch
                    onChange = {handleNameFilterChange}
                    autoFocus = {true}
                />
                <SmallItemTable
                    maxItems = {20}
                    nameFilter = {nameFilter}
                    defaultRandom = {true}
                    fleaValue
                    traderValue
                    instaProfit
                    hideBorders
                />
            </div>
            <div
                className = 'start-section-wrapper'
            >
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
                <Link
                    to = {`/ammo/`}
                >
                    <h2>
                        <Icon
                            path={Icons.mdiAmmunition}
                            size={1}
                            rotate={90}
                            className = 'icon-with-text'
                        />
                        Ammo chart
                    </h2>
                    <img
                        alt = 'Ammo chart'
                        className = 'link-image'
                        height = '140'
                        loading='lazy'
                        src = {`${process.env.PUBLIC_URL}/images/ammo-chart-thumbnail.jpg`}
                        width = '256'
                    />
                </Link>
                <h3>
                    <Icon
                        path={Icons.mdiHammerWrench}
                        size={1}
                        className = 'icon-with-text'
                    />
                    Tools
                </h3>
                <ul>
                    <li>
                        <Link
                            to = '/loot-tier/'
                        >
                            <Icon
                                path={Icons.mdiFinance}
                                size={1}
                                className = 'icon-with-text'
                            />
                            Loot tiers
                        </Link>
                    </li>
                    <li>
                        <Link
                            to = '/barters/'
                        >
                            <Icon
                                path={Icons.mdiAccountSwitch}
                                size={1}
                                className = 'icon-with-text'
                            />
                            Barter trades
                        </Link>
                    </li>
                    <li>
                        <Link
                            to = '/hideout-profit/'
                        >
                            <Icon
                                path={Icons.mdiProgressWrench}
                                size={1}
                                className = 'icon-with-text'
                            />
                            Hideout crafts
                        </Link>
                    </li>
                </ul>
                <h3>
                    <Link
                        to={'/maps'}
                    >
                        <Icon
                            path={Icons.mdiMap}
                            size={1}
                            className = 'icon-with-text'
                        />
                        Maps
                    </Link>
                </h3>
                <ul>
                    {mapData.map(mapData => {
                        return <li
                            key = {`map-link-${mapData.key}`}
                        >
                            <Link
                                to = {`/map/${mapData.key}`}
                            >
                                {mapData.displayText}
                            </Link>
                        </li>;
                    })}
                </ul>
                <h3>
                    <Link
                        to={'/items'}
                    >
                        <Icon
                            path={Icons.mdiViewGrid}
                            size={1}
                            className = 'icon-with-text'
                        />
                        Items
                    </Link>
                </h3>
                <ul>
                    {categoryPages.map( (categoryPage) => {
                        return <li
                            key = {`start-link-to-${categoryPage.key}`}
                        >
                            <Link
                                to = {`/items/${categoryPage.key}`}
                            >
                                <Icon
                                    path={Icons[categoryPage.icon]}
                                    size={1}
                                    className = 'icon-with-text'
                                />
                                {categoryPage.displayText}
                            </Link>
                        </li>
                    })}
                </ul>
                <h3>
                    <Link
                        to={'/traders'}
                    >
                        <Icon
                            path={Icons.mdiAccountGroup}
                            size={1}
                            className = 'icon-with-text'
                        />
                        Traders
                    </Link>
                </h3>
                <ul
                    className='traders-list'
                >
                    <li>
                        <Link
                            to = {`/traders/prapor`}
                        >
                            <img
                                alt='Prapor icon'
                                className='trader-icon'
                                src={`${process.env.PUBLIC_URL}/images/prapor-icon.jpg`}
                            />
                            Prapor
                        </Link>
                    </li>
                    <li>
                        <Link
                            to = {`/traders/therapist`}
                        >
                            <img
                                alt='Therapist icon'
                                className='trader-icon'
                                src={`${process.env.PUBLIC_URL}/images/therapist-icon.jpg`}
                            />
                            Therapist
                        </Link>
                    </li>
                    <li>
                        <Link
                            to = {`/traders/skier`}
                        >
                            <img
                                alt='Skier icon'
                                className='trader-icon'
                                src={`${process.env.PUBLIC_URL}/images/skier-icon.jpg`}
                            />
                            Skier
                        </Link>
                    </li>
                    <li>
                        <Link
                            to = {`/traders/peacekeeper`}
                        >
                            <img
                                alt='Peacekeeper icon'
                                className='trader-icon'
                                src={`${process.env.PUBLIC_URL}/images/peacekeeper-icon.jpg`}
                            />
                            Peacekeeper
                        </Link>
                    </li>
                    <li>
                        <Link
                            to = {`/traders/mechanic`}
                        >
                            <img
                                alt='Prapor icon'
                                className='trader-icon'
                                src={`${process.env.PUBLIC_URL}/images/mechanic-icon.jpg`}
                            />
                            Mechanic
                        </Link>
                    </li>
                    <li>
                        <Link
                            to = {`/traders/ragman`}
                        >
                            <img
                                alt='Ragman icon'
                                className='trader-icon'
                                src={`${process.env.PUBLIC_URL}/images/ragman-icon.jpg`}
                            />
                            Ragman
                        </Link>
                    </li>
                    <li>
                        <Link
                            to = {`/traders/jaeger`}
                        >
                            <img
                                alt='Jaeger icon'
                                className='trader-icon'
                                src={`${process.env.PUBLIC_URL}/images/jaeger-icon.jpg`}
                            />
                            Jaeger
                        </Link>
                    </li>
                </ul>
            </div>
        </div>,
    ];
};

export default Start;