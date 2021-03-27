import {
    Link
} from 'react-router-dom';
import {Helmet} from 'react-helmet';

import ID from '../../components/ID.jsx';
import './index.css';

import Icon from '@mdi/react'
import { mdiHanger } from '@mdi/js';
import { mdiTshirtCrew } from '@mdi/js';
import { mdiBagPersonal } from '@mdi/js';
import { mdiRacingHelmet } from '@mdi/js';
import { mdiSunglasses } from '@mdi/js';

function Guides(props) {
    return [
        <Helmet
            key = {'loot-tier-helmet'}
        >
            <meta
                charSet='utf-8'
            />
            <title>
                Escape from Tarkov Gear
            </title>
            <meta
                name = 'description'
                content = 'Escape from Tarkov gear guides and graphs'
            />
        </Helmet>,
        <div
            className = {'page-wrapper'}
            key = 'map-page-wrapper'
        >
            <h1
                className = 'center-title'
            >
                <Icon 
                    path={mdiHanger}
                    size={1.5}
                    className = 'icon-with-text'
                />
                Escape from Tarkov Gear
            </h1>
            <div
                className = 'guides-list-wrapper'
            >
                <Link
                    to = {`/gear/armor`}
                    className = 'screen-link'
                >
                    <h2
                        className = 'center-title'
                    >
                        <Icon 
                            path={mdiTshirtCrew}
                            size={1}
                            className = 'icon-with-text'
                        />
                        Armor
                    </h2>
                    <img
                        alt = {'Armor table'}
                        src = {`${process.env.PUBLIC_URL}/images/armor-table.jpg`}
                    />
                </Link>
                <Link
                    to = {`/gear/backpacks`}
                    className = 'screen-link'
                >
                    <h2
                        className = 'center-title'
                    >
                        <Icon 
                            path={mdiBagPersonal}
                            size={1}
                            className = 'icon-with-text'
                        />
                        Backpacks
                    </h2>
                    <img
                        alt = {'Backpacks table'}
                        src = {`${process.env.PUBLIC_URL}/images/backpacks-table.jpg`}
                    />
                </Link>
                <Link
                    to = {`/gear/helmets`}
                    className = 'screen-link'
                >
                    <h2
                        className = 'center-title'
                    >
                        <Icon 
                            path={mdiRacingHelmet}
                            size={1}
                            className = 'icon-with-text'
                        />
                        Helmet
                    </h2>
                    <img
                        alt = {'Helmet table'}
                        src = {`${process.env.PUBLIC_URL}/images/helmet-table.jpg`}
                    />
                </Link>
                <Link
                    to = {`/gear/glasses`}
                    className = 'screen-link'
                >
                    <h2
                        className = 'center-title'
                    >
                        <Icon 
                            path={mdiSunglasses}
                            size={1}
                            className = 'icon-with-text'
                        />
                        Glasses
                    </h2>
                    <img
                        alt = {'Glasses table'}
                        src = {`${process.env.PUBLIC_URL}/images/glasses-table.jpg`}
                    />
                </Link>
            </div>
        </div>,
        <ID
            key = {'session-id'}
            sessionID = {props.sessionID}
        />
    ];
};

export default Guides;
