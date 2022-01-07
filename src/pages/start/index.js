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
                    <Icon
                        path={Icons.mdiMap}
                        size={1}
                        className = 'icon-with-text'
                    />
                    Maps
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
                    {/* <Icon
                        path={mdiMap}
                        size={1}
                        className = 'icon-with-text'
                    /> */}
                    Items
                </h3>
                {categoryPages.map( (categoryPage) => {
                    return <Link
                        to = {`/items/${categoryPage.key}`}
                    >
                        <h2>
                            <Icon
                                path={Icons[categoryPage.icon]}
                                size={1}
                                className = 'icon-with-text'
                            />
                            {categoryPage.displayText}
                        </h2>
                    </Link>
                })}
            </div>
        </div>,
    ];
};

export default Start;