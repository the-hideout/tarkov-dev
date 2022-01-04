import {
    Link
} from 'react-router-dom';
import {Helmet} from 'react-helmet';

import Icon from '@mdi/react'
import {
    mdiHanger,
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

import ItemSearch from '../../components/item-search';

import './index.css';

function Guides(props) {
    return [
        <Helmet
            key = {'loot-tier-helmet'}
        >
            <meta
                charSet='utf-8'
            />
            <title>
                Escape from Tarkov Items
            </title>
            <meta
                name = 'description'
                content = 'Escape from Tarkov item guides and graphs'
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
                Escape from Tarkov Items
            </h1>
            <ItemSearch
                showDropdown
            />
            <div
                className = 'guides-list-wrapper'
            >
                <Link
                    to = {`/items/armor`}
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
                        loading='lazy'
                        src = {`${process.env.PUBLIC_URL}/images/armor-table-thumbnail.jpg`}
                    />
                </Link>
                <Link
                    to = {`/items/backpacks`}
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
                        loading='lazy'
                        src = {`${process.env.PUBLIC_URL}/images/backpacks-table-thumbnail.jpg`}
                    />
                </Link>
                <Link
                    to = {`/items/barter-items`}
                    className = 'screen-link'
                >
                    <h2
                        className = 'center-title'
                    >
                        <Icon
                            path={mdiPliers}
                            size={1}
                            className = 'icon-with-text'
                        />
                        Barter Items
                    </h2>
                    <img
                        alt = {'Barter Items table'}
                        loading='lazy'
                        src = {`${process.env.PUBLIC_URL}/images/barter-items-table-thumbnail.jpg`}
                    />
                </Link>
                <Link
                    to = {`/items/helmets`}
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
                        loading='lazy'
                        src = {`${process.env.PUBLIC_URL}/images/helmets-table-thumbnail.jpg`}
                    />
                </Link>
                <Link
                    to = {`/items/glasses`}
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
                        loading='lazy'
                        src = {`${process.env.PUBLIC_URL}/images/glasses-table-thumbnail.jpg`}
                    />
                </Link>
                <Link
                    to = {`/items/grenades`}
                    className = 'screen-link'
                >
                    <h2
                        className = 'center-title'
                    >
                        <Icon
                            path={mdiGasCylinder}
                            size={1}
                            className = 'icon-with-text'
                        />
                        Grenades
                    </h2>
                    <img
                        alt = {'Grenades table'}
                        loading='lazy'
                        src = {`${process.env.PUBLIC_URL}/images/grenades-table-thumbnail.jpg`}
                    />
                </Link>
                <Link
                    to = {`/items/guns`}
                    className = 'screen-link'
                >
                    <h2
                        className = 'center-title'
                    >
                        <Icon
                            path={mdiPistol}
                            size={1}
                            className = 'icon-with-text'
                        />
                        Guns
                    </h2>
                    <img
                        alt = {'Guns table'}
                        loading='lazy'
                        src = {`${process.env.PUBLIC_URL}/images/guns-table-thumbnail.jpg`}
                    />
                </Link>
                <Link
                    to = {`/items/headsets`}
                    className = 'screen-link'
                >
                    <h2
                        className = 'center-title'
                    >
                        <Icon
                            path={mdiHeadset}
                            size={1}
                            className = 'icon-with-text'
                        />
                        Headsets
                    </h2>
                    <img
                        alt = {'Headsets table'}
                        loading='lazy'
                        src = {`${process.env.PUBLIC_URL}/images/headsets-table-thumbnail.jpg`}
                    />
                </Link>
                <Link
                    to = {`/items/keys`}
                    className = 'screen-link'
                >
                    <h2
                        className = 'center-title'
                    >
                        <Icon
                            path={mdiKeyVariant}
                            size={1}
                            className = 'icon-with-text'
                        />
                        Keys
                    </h2>
                    <img
                        alt = {'Keys table'}
                        loading='lazy'
                        src = {`${process.env.PUBLIC_URL}/images/keys-table-thumbnail.jpg`}
                    />
                </Link>
                <Link
                    to = {`/items/mods`}
                    className = 'screen-link'
                >
                    <h2
                        className = 'center-title'
                    >
                        <Icon
                            path={mdiMagazineRifle}
                            size={1}
                            className = 'icon-with-text'
                        />
                        Mods
                    </h2>
                    <img
                        alt = {'Mods table'}
                        loading='lazy'
                        src = {`${process.env.PUBLIC_URL}/images/mods-table-thumbnail.jpg`}
                    />
                </Link>
                <Link
                    to = {`/items/pistol-grips`}
                    className = 'screen-link'
                >
                    <h2
                        className = 'center-title'
                    >
                        <Icon
                            path={mdiHandPointingLeft}
                            size={1}
                            className = 'icon-with-text'
                        />
                        Pistol Grips
                    </h2>
                    <img
                        alt = {'Pistol grips'}
                        loading='lazy'
                        src = {`${process.env.PUBLIC_URL}/images/pistol-grips-table-thumbnail.jpg`}
                    />
                </Link>
                <Link
                    to = {`/items/provisions`}
                    className = 'screen-link'
                >
                    <h2
                        className = 'center-title'
                    >
                        <Icon
                            path={mdiFoodForkDrink}
                            size={1}
                            className = 'icon-with-text'
                        />
                        Provisions
                    </h2>
                    <img
                        alt = {'Glasses table'}
                        loading='lazy'
                        src = {`${process.env.PUBLIC_URL}/images/glasses-table-thumbnail.jpg`}
                    />
                </Link>
                <Link
                    to = {`/items/rigs`}
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
                        loading='lazy'
                        src = {`${process.env.PUBLIC_URL}/images/rigs-table-thumbnail.jpg`}
                    />
                </Link>
                <Link
                    to = {`/items/suppressors`}
                    className = 'screen-link'
                >
                    <h2
                        className = 'center-title'
                    >
                        <Icon
                            path={mdiBottleWine}
                            size={1}
                            className = 'icon-with-text'
                        />
                        Suppressors
                    </h2>
                    <img
                        alt = {'Suppressors table'}
                        loading='lazy'
                        src = {`${process.env.PUBLIC_URL}/images/suppressors-table-thumbnail.jpg`}
                    />
                </Link>
            </div>
        </div>,
    ];
};

export default Guides;
