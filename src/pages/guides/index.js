import {
    Link
} from 'react-router-dom';
import {Helmet} from 'react-helmet';

import './index.css';

import Icon from '@mdi/react'
import { mdiHanger, mdiTshirtCrew, mdiBagPersonal, mdiRacingHelmet, mdiSunglasses, mdiTshirtCrewOutline } from '@mdi/js';

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
                        src = {`${process.env.PUBLIC_URL}/images/armor-table-thumbnail.jpg`}
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
                        src = {`${process.env.PUBLIC_URL}/images/backpacks-table-thumbnail.jpg`}
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
                        src = {`${process.env.PUBLIC_URL}/images/helmets-table-thumbnail.jpg`}
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
                        src = {`${process.env.PUBLIC_URL}/images/glasses-table-thumbnail.jpg`}
                    />
                </Link>
                <Link
                    to = {`/gear/rigs`}
                    className = 'screen-link'
                >
                    <h2
                        className = 'center-title'
                    >
                        <Icon
                            path={mdiTshirtCrewOutline}
                            size={1}
                            className = 'icon-with-text'
                        />
                        Rigs
                    </h2>
                    <img
                        alt = {'Rigs table'}
                        src = {`${process.env.PUBLIC_URL}/images/rigs-table-thumbnail.jpg`}
                    />
                </Link>
            </div>
        </div>,
    ];
};

export default Guides;
