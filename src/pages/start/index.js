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
    mdiPliers,
    mdiGasCylinder,
    mdiPistol,
    mdiHeadset,
    mdiKeyVariant,
    mdiMagazineRifle,
    mdiFoodForkDrink,
    mdiHandPointingLeft,
} from '@mdi/js';

import './index.css';

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
                        loading='lazy'
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
                <h3>
                    {/* <Icon
                        path={mdiMap}
                        size={1}
                        className = 'icon-with-text'
                    /> */}
                    Items
                </h3>
                <Link
                    to = {`/items/armor`}
                >
                    <h2>
                        <Icon
                            path={mdiTshirtCrew}
                            size={1}
                            className = 'icon-with-text'
                        />
                        Armor
                    </h2>
                </Link>
                <Link
                    to = {`/items/backpacks`}
                >
                    <h2>
                        <Icon
                            path={mdiBagPersonal}
                            size={1}
                            className = 'icon-with-text'
                        />
                        Backpacks
                    </h2>
                </Link>
                <Link
                    to = {`/items/barter-items`}
                >
                    <h2>
                        <Icon
                            path={mdiPliers}
                            size={1}
                            className = 'icon-with-text'
                        />
                        Barter Items
                    </h2>
                </Link>
                <Link
                    to = {`/items/helmets`}
                >
                    <h2>
                        <Icon
                            path={mdiRacingHelmet}
                            size={1}
                            className = 'icon-with-text'
                        />
                        Helmets
                    </h2>
                </Link>
                <Link
                    to = {`/items/glasses`}
                >
                    <h2>
                        <Icon
                            path={mdiSunglasses}
                            size={1}
                            className = 'icon-with-text'
                        />
                        Glasses
                    </h2>
                </Link>
                <Link
                    to = {`/items/grenades`}
                >
                    <h2>
                        <Icon
                            path={mdiGasCylinder}
                            size={1}
                            className = 'icon-with-text'
                        />
                        Grenades
                    </h2>
                </Link>
                <Link
                    to = {`/items/guns`}
                >
                    <h2>
                        <Icon
                            path={mdiPistol}
                            size={1}
                            className = 'icon-with-text'
                        />
                        Guns
                    </h2>
                </Link>
                <Link
                    to = {`/items/headsets`}
                >
                    <h2>
                        <Icon
                            path={mdiHeadset}
                            size={1}
                            className = 'icon-with-text'
                        />
                        Headsets
                    </h2>
                </Link>
                <Link
                    to = {`/items/keys`}
                >
                    <h2>
                        <Icon
                            path={mdiKeyVariant}
                            size={1}
                            className = 'icon-with-text'
                        />
                        Keys
                    </h2>
                </Link>
                <Link
                    to = {`/items/mods`}
                >
                    <h2>
                        <Icon
                            path={mdiMagazineRifle}
                            size={1}
                            className = 'icon-with-text'
                        />
                        Mods
                    </h2>
                </Link>
                <Link
                    to = {`/items/pistol-grips`}
                >
                    <h2>
                        <Icon
                            path={mdiHandPointingLeft}
                            size={1}
                            className = 'icon-with-text'
                        />
                        Pistol Grips
                    </h2>
                </Link>
                <Link
                    to = {`/items/provisions`}
                >
                    <h2>
                        <Icon
                            path={mdiFoodForkDrink}
                            size={1}
                            className = 'icon-with-text'
                        />
                        Provisions
                    </h2>
                </Link>
                <Link
                    to = {`/items/rigs`}
                >
                    <h2>
                        <Icon
                            path={mdiTshirtCrewOutline}
                            size={1}
                            className = 'icon-with-text'
                        />
                        Rigs
                    </h2>
                </Link>
                <Link
                    to = {`/items/suppressors`}
                >
                    <h2>
                        <Icon
                            path={mdiBottleWine}
                            size={1}
                            className = 'icon-with-text'
                        />
                        Suppressors
                    </h2>
                </Link>
            </div>
        </div>,
    ];
};

export default Start;