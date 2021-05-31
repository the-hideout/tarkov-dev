import { useState, useCallback } from 'react';
import {Helmet} from 'react-helmet';
import {
    Link
} from "react-router-dom";

import QueueBrowserTask from '../../modules/queue-browser-task';
import mapData from '../../data/maps.json';
import SmallItemTable from '../../components/small-item-table';

import Icon from '@mdi/react'
import { mdiAmmunition } from '@mdi/js';
import { mdiHammerWrench } from '@mdi/js';
import { mdiFinance } from '@mdi/js';
import { mdiAccountSwitch } from '@mdi/js';
import { mdiProgressWrench } from '@mdi/js';
import { mdiMap } from '@mdi/js';
import { mdiTshirtCrew } from '@mdi/js';
import { mdiBagPersonal } from '@mdi/js';
import { mdiRacingHelmet } from '@mdi/js';
import { mdiSunglasses } from '@mdi/js';

import './index.css';

function Item(props) {
    const defaultQuery = new URLSearchParams(window.location.search).get('search');
    const [nameFilter, setNameFilter] = useState(defaultQuery || '');

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
            className="display-wrapper start-wrapper"
            key = {'display-wrapper'}
        >
            <div
                className = 'start-section-wrapper'
            >
                {/* <h3>
                    Items
                </h3> */}
                <input
                    type="text"
                    defaultValue = {nameFilter}
                    onChange = {handleNameFilterChange}
                    placeholder = 'Search...'
                />
                <SmallItemTable
                    maxItems = {8}
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
                        src = {`${process.env.PUBLIC_URL}/images/ammo-chart-thumbnail.jpg`}
                    />
                </Link>
            </div>
            <div
                className = 'start-section-wrapper'
            >
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
                        return <li>
                            <Link
                                to = {`/map/${mapData.key}`}
                            >
                                {mapData.displayText}
                            </Link>
                        </li>;
                    })}
                </ul>

            </div>
            <div
                className = 'start-section-wrapper'
                >
                {/* <h3>
                    Gear charts
                </h3> */}
                {/* <ul>
                    <li>
                        <Link
                            to = '/gear/armor'
                        >
                            Armor chart
                        </Link>
                    </li>
                    <li>
                        <Link
                            to = '/gear/backpacks'
                        >
                            Backpack chart
                        </Link>
                    </li>
                    <li>
                        <Link
                            to = '/gear/helmets'
                        >
                            Helmets chart
                        </Link>
                    </li>
                    <li>
                        <Link
                            to = '/gear/glasses'
                        >
                            Glasses chart
                        </Link>
                    </li>
                </ul> */}
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
                        src = {`${process.env.PUBLIC_URL}/images/armor-table-thumbnail.jpg`}
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
                        src = {`${process.env.PUBLIC_URL}/images/backpacks-table-thumbnail.jpg`}
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
                        src = {`${process.env.PUBLIC_URL}/images/helmets-table-thumbnail.jpg`}
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
                        src = {`${process.env.PUBLIC_URL}/images/glasses-table-thumbnail.jpg`}
                    />
                </Link>
            </div>
        </div>,
    ];
};

export default Item;