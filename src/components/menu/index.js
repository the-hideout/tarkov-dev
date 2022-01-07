import {useState} from 'react';
import {
    Link
} from "react-router-dom";
import { useTranslation } from 'react-i18next';
import Icon from '@mdi/react';
import {
    mdiCogOutline,
    mdiRemote,
    mdiHeartFlash,
} from '@mdi/js';

import MenuItem from './MenuItem';
import MenuIcon from './MenuIcon.jsx';
import PatreonButton from '../patreon-button';

import ammoData from '../../data/ammo.json';
import mapData from '../../data/maps.json';
import itemsData from '../../data/category-pages.json';

import './index.css';

const ammoTypes = [...new Set(ammoData.data.map((ammoData) => {
    return ammoData.type
}))].sort();

const Menu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const handleMenuClick = () => {
        setIsOpen(!isOpen);
    };
    const { t } = useTranslation();

    return <nav
            key = 'main-navigation'
            className = "navigation"
        >
            <Link
                className = "branding"
                to = '/'
            >
                Tarkov Tools
            </Link>
            <Link
                aria-label="Remote control"
                className = 'mobile-only-link'
                to = '/control/'
                onClick = {setIsOpen.bind(this, false)}
            >
                <Icon
                    path={mdiRemote}
                    size={1}
                    className = 'icon-with-text'
                />
            </Link>
            <Link
                aria-label="Settings"
                className = 'mobile-only-link'
                to = '/settings/'
                onClick = {setIsOpen.bind(this, false)}
            >
                <Icon
                    path={mdiCogOutline}
                    size={1}
                    className = 'icon-with-text'
                />
            </Link>
            <PatreonButton
                onlyLarge
                wrapperStyle = {{
                    position: 'relative',
                    margin: 0,
                    bottom: 9,
                }}
                linkStyle = {{
                    borderRadius: '5px',
                    color: '#fff',
                    padding: '5px 20px',
                    margin: '0 20px 0 0 ',
                }}
            >
                Support on Patreon
                <Icon
                    path={mdiHeartFlash}
                    size={1}
                    className = 'icon-with-text'
                />
            </PatreonButton>
            <MenuIcon
                onClick = {handleMenuClick}
            />
            <ul
                className = {`menu${isOpen ? ' open': ''}`}
            >
                <li
                    className = "submenu-wrapper"
                >
                    <Link
                        to = '/'
                        onClick = {setIsOpen.bind(this, false)}
                    >
                        {t('Home')}
                    </Link>
                </li>
                <li
                    className = "submenu-wrapper"
                >
                    <Link
                        to = '/ammo/'
                    >
                        {t('Ammo')}
                    </Link>
                    <ul>
                    {ammoTypes.map(ammoType =>
                        <MenuItem
                            checkbox
                            displayText = {ammoType}
                            key = {ammoType}
                            prefix = '/ammo'
                            to = {`/ammo/${ammoType}`}
                            onClick = {setIsOpen.bind(this, false)}
                        />
                    )}
                    </ul>
                </li>
                <li
                    className = "submenu-wrapper"
                >
                    <Link
                        to = '/maps/'
                    >
                        {t('Maps')}
                    </Link>
                    <ul>
                    {mapData.map(map =>
                        <MenuItem
                            displayText = {map.displayText}
                            key = {map.key}
                            to = {`/map/${map.key}`}
                            onClick = {setIsOpen.bind(this, false)}
                        />
                    )}
                    </ul>
                </li>
                <li
                    className = "submenu-wrapper"
                >
                    <Link
                        to = '/items/'
                    >
                        {t('Items')}
                    </Link>
                    <ul>
                        {itemsData.map(categoryPage =>
                            <MenuItem
                                displayText = {categoryPage.displayText}
                                key = {categoryPage.key}
                                to = {`/items/${categoryPage.key}`}
                                onClick = {setIsOpen.bind(this, false)}
                            />
                        )}
                    </ul>
                </li>
                <li
                    className = "submenu-wrapper"
                >
                    <Link
                        to = '/traders'
                    >
                        {t('Traders')}
                    </Link>
                    <ul>
                        <MenuItem
                            displayText = {t('Prapor')}
                            to = {`/traders/prapor`}
                            onClick = {setIsOpen.bind(this, false)}
                        />
                        <MenuItem
                            displayText = {t('Therapist')}
                            to = {`/traders/therapist`}
                            onClick = {setIsOpen.bind(this, false)}
                        />
                        <MenuItem
                            displayText = {t('Skier')}
                            to = {`/traders/skier`}
                            onClick = {setIsOpen.bind(this, false)}
                        />
                        <MenuItem
                            displayText = {t('Peacekeeper')}
                            to = {`/traders/peacekeeper`}
                            onClick = {setIsOpen.bind(this, false)}
                        />
                        <MenuItem
                            displayText = {t('Mechanic')}
                            to = {`/traders/mechanic`}
                            onClick = {setIsOpen.bind(this, false)}
                        />
                        <MenuItem
                            displayText = {t('Ragman')}
                            to = {`/traders/ragman`}
                            onClick = {setIsOpen.bind(this, false)}
                        />
                        <MenuItem
                            displayText = {t('Jaeger')}
                            to = {`/traders/jaeger`}
                            onClick = {setIsOpen.bind(this, false)}
                        />
                    </ul>
                </li>
                <li
                    className = "submenu-wrapper"
                >
                    <Link
                        to = '/loot-tier/'
                        onClick = {setIsOpen.bind(this, false)}
                    >
                        {t('Loot tiers')}
                    </Link>
                </li>

                <li
                    className = "submenu-wrapper"
                >
                    <Link
                        to = '/barters/'
                        onClick = {setIsOpen.bind(this, false)}
                    >
                        {t('Barter profit')}
                    </Link>
                </li>
                <li
                    className = "submenu-wrapper"
                >
                    <Link
                        to = '/hideout-profit/'
                        onClick = {setIsOpen.bind(this, false)}
                    >
                        {t('Hideout profit')}
                    </Link>
                </li>
                <li
                    className = "submenu-wrapper desktop-only-link"
                >
                    <Link
                        aria-label="Remote control"
                        to = '/control/'
                        onClick = {setIsOpen.bind(this, false)}
                    >
                        <Icon
                            path={mdiRemote}
                            size={1}
                            className = 'icon-with-text'
                        />
                    </Link>
                </li>
                <li
                    className = "submenu-wrapper desktop-only-link"
                >
                    <Link
                        aria-label="Settings"
                        to = '/settings/'
                        onClick = {setIsOpen.bind(this, false)}
                    >
                        <Icon
                            path={mdiCogOutline}
                            size={1}
                            className = 'icon-with-text'
                        />
                    </Link>
                </li>
            </ul>
    </nav>;
}

export default Menu;


