import { useState, useCallback } from 'react';
import {Helmet} from 'react-helmet';
import {
    Link
} from "react-router-dom";

import QueueBrowserTask from '../../modules/queue-browser-task';
import mapData from '../../data/maps.json';
import SmallItemTable from '../../components/small-item-table';

import Icon from '@mdi/react'
import {
    mdiAmmunition,
    mdiHammerWrench,
    mdiFinance,
    mdiAccountSwitch,
    mdiProgressWrench,
    mdiMap,
    mdiTshirtCrew,
    mdiBagPersonal,
    mdiRacingHelmet,
    mdiSunglasses,
    mdiTshirtCrewOutline,
    mdiBottleWine,
} from '@mdi/js';

import './index.css';

function Start(props) {
    const defaultQuery = new URLSearchParams(window.location.search).get('search');
    const [nameFilter, setNameFilter] = useState(defaultQuery || '');

    const handleNameFilterChange = useCallback((e) => {
        if (typeof window !== 'undefined') {
            const name = e.target.value.toLowerCase();

            // schedule this for the next loop so that the UI
            // has time to update but we do the filtering as soon as possible
            QueueBrowserTask.task(() => {
                setNameFilter(name);
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
                <input
                    type="text"
                    defaultValue = {nameFilter}
                    onChange = {handleNameFilterChange}
                    placeholder = 'Search...'
                    autoFocus = {true}
                />
                <SmallItemTable
                    maxItems = {20}
                    nameFilter = {nameFilter}
                    defaultRandom = {true}
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

                <Link
                    to = {`/ammo/`}
                >
                    <h2>
                        <Icon
                            path={mdiAmmunition}
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
                        src = {`${process.env.PUBLIC_URL}/images/ammo-chart-thumbnail.jpg`}
                        width = '256'
                    />
                </Link>
                <h3>
                    <Icon
                        path={mdiHammerWrench}
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
                                path={mdiFinance}
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
                                path={mdiAccountSwitch}
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
                                path={mdiProgressWrench}
                                size={1}
                                className = 'icon-with-text'
                            />
                            Hideout crafts
                        </Link>
                    </li>
                </ul>
                <h3>
                    <Icon
                        path={mdiMap}
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
                <Link
                    to = {`/gear/armor`}
                >
                    <h2>
                        <Icon
                            path={mdiTshirtCrew}
                            size={1}
                            className = 'icon-with-text'
                        />
                        Armor
                    </h2>
                    <img
                        alt = {'Armor table'}
                        className = 'link-image'
                        height = '140'
                        src = {`${process.env.PUBLIC_URL}/images/armor-table-thumbnail.jpg`}
                        width = '256'
                    />
                </Link>
                <Link
                    to = {`/gear/backpacks`}
                >
                    <h2>
                        <Icon
                            path={mdiBagPersonal}
                            size={1}
                            className = 'icon-with-text'
                        />
                        Backpacks
                    </h2>
                    <img
                        alt = {'Backpacks table'}
                        className = 'link-image'
                        height = '140'
                        src = {`${process.env.PUBLIC_URL}/images/backpacks-table-thumbnail.jpg`}
                        width = '256'
                    />
                </Link>
                <Link
                    to = {`/gear/helmets`}
                >
                    <h2>
                        <Icon
                            path={mdiRacingHelmet}
                            size={1}
                            className = 'icon-with-text'
                        />
                        Helmets
                    </h2>
                    <img
                        alt = {'Helmets table'}
                        className = 'link-image'
                        height = '140'
                        src = {`${process.env.PUBLIC_URL}/images/helmets-table-thumbnail.jpg`}
                        width = '256'
                    />
                </Link>
                <Link
                    to = {`/gear/glasses`}
                >
                    <h2>
                        <Icon
                            path={mdiSunglasses}
                            size={1}
                            className = 'icon-with-text'
                        />
                        Glasses
                    </h2>
                    <img
                        alt = {'Glasses table'}
                        className = 'link-image'
                        height = '140'
                        src = {`${process.env.PUBLIC_URL}/images/glasses-table-thumbnail.jpg`}
                        width = '256'
                    />
                </Link>
                <Link
                    to = {`/gear/rigs`}
                >
                    <h2>
                        <Icon
                            path={mdiTshirtCrewOutline}
                            size={1}
                            className = 'icon-with-text'
                        />
                        Rigs
                    </h2>
                    <img
                        alt = {'Rigs table'}
                        className = 'link-image'
                        height = '140'
                        src = {`${process.env.PUBLIC_URL}/images/rigs-table-thumbnail.jpg`}
                        width = '256'
                    />
                </Link>
                <Link
                    to = {`/gear/suppressors`}
                >
                    <h2>
                        <Icon
                            path={mdiBottleWine}
                            size={1}
                            className = 'icon-with-text'
                        />
                        Suppressors
                    </h2>
                    <img
                        alt = {'Suppressors table'}
                        className = 'link-image'
                        height = '140'
                        src = {`${process.env.PUBLIC_URL}/images/suppressors-table-thumbnail.jpg`}
                        width = '256'
                    />
                </Link>
            </div>
        </div>,
    ];
};

export default Start;