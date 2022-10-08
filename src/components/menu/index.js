import { useState } from 'react';
import { Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icon from '@mdi/react';
import {
    mdiCogOutline,
    mdiRemote,
    // mdiHeartFlash,
    mdiMenu,
    // mdiHandHeart,
} from '@mdi/js';

import MenuItem from './MenuItem';
// import PatreonButton from '../patreon-button';
import UkraineButton from '../ukraine-button';
import LoadingSmall from '../loading-small';
import { BossListNav } from '../boss-list';

import { caliberMap } from '../../modules/format-ammo';
import rawMapData from '../../data/maps.json';
import itemsData from '../../data/category-pages.json';


import './index.css';

const ammoTypes = Object.values(caliberMap).sort();

const getAmmoMenu = (setIsOpen) => {
    const shotIndex = ammoTypes.findIndex(ammoType => ammoType === '12 Gauge Shot');
    const ammoMenu = ammoTypes.map((ammoType) => (
        <MenuItem
            checkbox
            displayText={ammoType}
            key={`menu-item-${ammoType}`}
            prefix="/ammo"
            to={`/ammo/${ammoType}`}
            onClick={setIsOpen.bind(this, false)}
        />
    ));
    ammoMenu.splice(shotIndex+1, 0, (
        <MenuItem
            checkbox
            displayText="12 Gauge Slug"
            key="menu-item-12 Gauge Slug"
            prefix="/ammo"
            to="/ammo/12 Gauge Slug"
            onClick={setIsOpen.bind(this, false)}
        />
    ));
    return ammoMenu;
};

const Menu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const handleMenuClick = () => {
        setIsOpen(!isOpen);
    };
    const { t } = useTranslation();

    return (
        <>
            {/* ALERT BANNER SECTION - uncomment the lines below to enable the alert banner */}
            {/* severity can be 'error', 'info', 'success', or 'warning' */}
            {/* <div><Alert severity="success">{"🌟 Flea market scanners have been leveled for this patch and all flea market data is now live! 🌟"}</Alert></div> */}
            {/* END ALERT BANNER SECTION */}
            <nav key="main-navigation" className="navigation">
                <Icon
                    path={mdiMenu}
                    size={1}
                    className="mobile-icon icon-with-text"
                    onClick={handleMenuClick}
                />
                <Link className="branding" to="/">
                    {/* Tarkov.dev */}
                    <img
                        alt="Tarkov.dev"
                        height={30}
                        width={186}
                        src={`${process.env.PUBLIC_URL}/tarkov-dev-logo.svg`}
                        className={'logo-padding'}
                        loading="lazy"
                    />
                </Link>
                <Link
                    aria-label="Remote control"
                    className="mobile-only-link"
                    to="/control/"
                    onClick={setIsOpen.bind(this, false)}
                >
                    <Icon path={mdiRemote} size={1} className="icon-with-text" />
                </Link>
                <Link
                    aria-label="Settings"
                    className="mobile-only-link"
                    to="/settings/"
                    onClick={setIsOpen.bind(this, false)}
                >
                    <Icon
                        path={mdiCogOutline}
                        size={1}
                        className="icon-with-text"
                    />
                </Link>
                <ul className={`menu${isOpen ? ' open' : ''}`}>
                    <li className="only-large" key="menu-ua-donate">
                        <UkraineButton />
                    </li>
                    {/*<li className="only-large">
                        <PatreonButton
                            wrapperStyle={{
                                margin: 0,
                            }}
                            linkStyle={{
                                color: '#fff',
                                padding: '5px 20px',
                                alignItems: 'center',
                            }}
                        >
                            {t('Support on Patreon')}
                            <Icon
                                path={mdiHeartFlash}
                                size={1}
                                className="icon-with-text"
                            />
                        </PatreonButton>
                    </li>*/}
                    <li className="submenu-wrapper" key="menu-ammo">
                        <Link to="/ammo/">{t('Ammo')}</Link>
                        <ul>
                            {getAmmoMenu(setIsOpen)}
                        </ul>
                    </li>
                    <li className="submenu-wrapper" key="menu-maps">
                        <Link to="/maps/">{t('Maps')}</Link>
                        <ul>
                            {rawMapData.map((mapsGroup) => (
                                mapsGroup.maps.map((map) => (
                                    <MenuItem
                                        displayText={map.displayText}
                                        key={`menu-item-${map.key}`}
                                        to={`/map/${map.key}`}
                                        onClick={setIsOpen.bind(this, false)}
                                    />
                                ))
                            ))}
                        </ul>
                    </li>
                    <li className="submenu-wrapper" key="menu-items">
                        <Link to="/items/">{t('Items')}</Link>
                        <ul>
                            {itemsData.map((categoryPage) => (
                                <MenuItem
                                    displayText={t(categoryPage.displayText)}
                                    key={categoryPage.key}
                                    to={`/items/${categoryPage.key}`}
                                    onClick={setIsOpen.bind(this, false)}
                                />
                            ))}
                        </ul>
                    </li>
                    <li className="submenu-wrapper" key="menu-traders">
                        <Link to="/traders">{t('Traders')}</Link>
                        <ul>
                            <MenuItem
                                displayText={t('Prapor')}
                                key="menu-item-prapor"
                                to={`/traders/prapor`}
                                onClick={setIsOpen.bind(this, false)}
                            />
                            <MenuItem
                                displayText={t('Therapist')}
                                key="menu-item-therapist"
                                to={`/traders/therapist`}
                                onClick={setIsOpen.bind(this, false)}
                            />
                            <MenuItem
                                displayText={t('Skier')}
                                key="menu-item-skier"
                                to={`/traders/skier`}
                                onClick={setIsOpen.bind(this, false)}
                            />
                            <MenuItem
                                displayText={t('Peacekeeper')}
                                key="menu-item-peacekeeper"
                                to={`/traders/peacekeeper`}
                                onClick={setIsOpen.bind(this, false)}
                            />
                            <MenuItem
                                displayText={t('Mechanic')}
                                key="menu-item-mechanic"
                                to={`/traders/mechanic`}
                                onClick={setIsOpen.bind(this, false)}
                            />
                            <MenuItem
                                displayText={t('Ragman')}
                                key="menu-item-ragman"
                                to={`/traders/ragman`}
                                onClick={setIsOpen.bind(this, false)}
                            />
                            <MenuItem
                                displayText={t('Jaeger')}
                                key="menu-item-jaeger"
                                to={`/traders/jaeger`}
                                onClick={setIsOpen.bind(this, false)}
                            />
                        </ul>
                    </li>
                    <li className="submenu-wrapper" key="menu-bosses">
                        <Link to="/bosses/">{t('Bosses')}</Link>
                        <Suspense fallback={<LoadingSmall />}>
                            <BossListNav onClick={setIsOpen.bind(this, false)} />
                        </Suspense>
                    </li>
                    <li className="submenu-wrapper" key="menu-barters">
                        <Link to="/barters/" onClick={setIsOpen.bind(this, false)}>
                            {t('Barter profit')}
                        </Link>
                    </li>
                    <li className="submenu-wrapper" key="menu-hideout-profit">
                        <Link
                            to="/hideout-profit/"
                            onClick={setIsOpen.bind(this, false)}
                        >
                            {t('Hideout profit')}
                        </Link>
                    </li>
                    <li className="submenu-wrapper menu-align-right" key="menu-more">
                        <Link to={"#"}>More...</Link>
                        <ul>
                            <li className="submenu-wrapper" key="menu-tasks">
                                <Link
                                    to="/tasks"
                                    onClick={setIsOpen.bind(this, false)}
                                >
                                    {t('Tasks')}
                                </Link>
                            </li>
                            <li className="submenu-wrapper" key="menu-loot-tier">
                                <Link
                                    to="/loot-tier/"
                                    onClick={setIsOpen.bind(this, false)}
                                >
                                    {t('Loot tiers')}
                                </Link>
                            </li>
                            <li className="submenu-wrapper" key="menu-hideout-costs">
                                <Link
                                    to="/hideout"
                                    onClick={setIsOpen.bind(this, false)}
                                >
                                    {t('Hideout build costs')}
                                </Link>
                            </li>
                            <li className="submenu-wrapper" key="menu-wipe-length">
                                <Link
                                    to="/wipe-length"
                                    onClick={setIsOpen.bind(this, false)}
                                >
                                    {t('Wipe length')}
                                </Link>
                            </li>
                            <li className="submenu-wrapper" key="menu-bitcoin-farm">
                                <Link
                                    to="/bitcoin-farm-calculator"
                                    onClick={setIsOpen.bind(this, false)}
                                >
                                    {t('Bitcoin Farm Profit')}
                                </Link>
                            </li>
                            <li className="submenu-wrapper" key="menu-api">
                                <Link
                                    to="/api/"
                                    onClick={setIsOpen.bind(this, false)}
                                >
                                    {t('API')}
                                </Link>
                            </li>
                            <li className="submenu-wrapper" key="menu-stats">
                                <Link
                                    to="/stats/"
                                    onClick={setIsOpen.bind(this, false)}
                                >
                                    {t('stats')}
                                </Link>
                            </li>
                        </ul>
                    </li>
                    <li className="submenu-wrapper desktop-only-link" key="menu-remote-control">
                        <Link
                            aria-label="Remote control"
                            to="/control/"
                            onClick={setIsOpen.bind(this, false)}
                        >
                            <Icon
                                path={mdiRemote}
                                // size={1}
                                className="icon-with-text"
                                size={'20px'}
                            />
                        </Link>
                    </li>
                    <li className="submenu-wrapper desktop-only-link" key="menu-settings">
                        <Link
                            aria-label="Settings"
                            to="/settings/"
                            onClick={setIsOpen.bind(this, false)}
                        >
                            <Icon
                                path={mdiCogOutline}
                                size={'20px'}
                                className="icon-with-text"
                            />
                        </Link>
                    </li>
                </ul>
            </nav>
        </>
    );
};

export default Menu;
