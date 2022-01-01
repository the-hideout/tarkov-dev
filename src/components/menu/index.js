import {useState} from 'react';
import {
    Link
} from "react-router-dom";
import { useTranslation } from 'react-i18next';
import Icon from '@mdi/react';
import {
    mdiCogOutline,
    mdiRemote,
} from '@mdi/js';

import MenuItem from './MenuItem';
import MenuIcon from './MenuIcon.jsx';
import PatreonButton from '../patreon-button';

import ammoData from '../../data/ammo.json';
import mapData from '../../data/maps.json';

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
                text = 'Support on Patreon'
                wrapperStyle = {{
                    margin: '0',
                }}
                linkStyle = {{
                    borderRadius: '5px',
                    color: '#fff',
                    padding: '5px 20px',
                    margin: '0 20px 0 0 ',
                }}
            />
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
                        <MenuItem
                            displayText = {t('Armor')}
                            to = {`/items/armor`}
                            onClick = {setIsOpen.bind(this, false)}
                        />
                        <MenuItem
                            displayText = {t('Backpacks')}
                            to = {`/items/backpacks`}
                            onClick = {setIsOpen.bind(this, false)}
                        />
                        <MenuItem
                            displayText = {t('Barter Items')}
                            to = {`/items/barter-items`}
                            onClick = {setIsOpen.bind(this, false)}
                        />
                        <MenuItem
                            displayText = {t('Glasses')}
                            to = {`/items/glasses`}
                            onClick = {setIsOpen.bind(this, false)}
                        />
                        <MenuItem
                            displayText = {t('Grenades')}
                            to = {`/items/grenades`}
                            onClick = {setIsOpen.bind(this, false)}
                        />
                        <MenuItem
                            displayText = {t('Guns')}
                            to = {`/items/guns`}
                            onClick = {setIsOpen.bind(this, false)}
                        />
                        <MenuItem
                            displayText = {t('Headsets')}
                            to = {`/items/headsets`}
                            onClick = {setIsOpen.bind(this, false)}
                        />
                        <MenuItem
                            displayText = {t('Helmets')}
                            to = {`/items/helmets`}
                            onClick = {setIsOpen.bind(this, false)}
                        />
                        <MenuItem
                            displayText = {t('Keys')}
                            to = {`/items/keys`}
                            onClick = {setIsOpen.bind(this, false)}
                        />
                        <MenuItem
                            displayText = {t('Mods')}
                            to = {`/items/mods`}
                            onClick = {setIsOpen.bind(this, false)}
                        />
                        <MenuItem
                            displayText = {t('Pistol Grips')}
                            to = {`/items/pistol-grips`}
                            onClick = {setIsOpen.bind(this, false)}
                        />
                        <MenuItem
                            displayText = {t('Provisions')}
                            to = {`/items/provisions`}
                            onClick = {setIsOpen.bind(this, false)}
                        />
                        <MenuItem
                            displayText = {t('Rigs')}
                            to = {`/items/rigs`}
                            onClick = {setIsOpen.bind(this, false)}
                        />
                        <MenuItem
                            displayText = {t('Suppressors')}
                            to = {`/items/suppressors`}
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


