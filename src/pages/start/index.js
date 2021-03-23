import { useState, useCallback } from 'react';
import {Helmet} from 'react-helmet';
import {
    Link
} from "react-router-dom";

import QueueBrowserTask from '../../modules/queue-browser-task';
import mapData from '../../data/maps.json';
import SmallItemTable from '../../components/small-item-table';

import './index.css';

function Item(props) {
    const [nameFilter, setNameFilter] = useState('');

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
                        Ammo chart
                    </h2>
                    <img
                        alt = 'Ammo chart'
                        src = {`${process.env.PUBLIC_URL}/images/ammo-chart.jpg`}
                    />
                </Link>
            </div>
            <div
                className = 'start-section-wrapper'
            >
                <h3>
                    Tools
                </h3>
                <ul>
                    <li>
                        <Link
                            to = '/loot-tier/'
                        >
                            Loot tiers
                        </Link>
                    </li>
                    <li>
                        <Link
                            to = '/barters/'
                        >
                            Barter trades
                        </Link>
                    </li>
                    <li>
                        <Link
                            to = '/hideout-profit/'
                        >
                            Hideout crafts
                        </Link>
                    </li>
                </ul>
                <h3>
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
                        Armor
                    </h2>
                    <img
                        alt = {'Armor table'}
                        src = {`${process.env.PUBLIC_URL}/images/armor-table.jpg`}
                    />
                </Link>
                <Link
                    to = {`/gear/backpacks`}
                >
                    <h2>
                        Backpacks
                    </h2>
                    <img
                        alt = {'Backpacks table'}
                        src = {`${process.env.PUBLIC_URL}/images/backpacks-table.jpg`}
                    />
                </Link>
                <Link
                    to = {`/gear/helmets`}
                >
                    <h2>
                        Helmets
                    </h2>
                    <img
                        alt = {'Helmets table'}
                        src = {`${process.env.PUBLIC_URL}/images/helmet-table.jpg`}
                    />
                </Link>
                <Link
                    to = {`/gear/glasses`}
                >
                    <h2>
                        Glasses
                    </h2>
                    <img
                        alt = {'Glasses table'}
                        src = {`${process.env.PUBLIC_URL}/images/glasses-table.jpg`}
                    />
                </Link>
            </div>
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
        </div>,
    ];
};

export default Item;