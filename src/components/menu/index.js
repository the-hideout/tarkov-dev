import { useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage.jsx';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '@mdi/react';
import {
    mdiCogOutline,
    mdiRemote,
    mdiClose,
} from '@mdi/js';

import { Box, Alert, IconButton, Collapse, Badge, LinearProgress } from '@mui/material';

import MenuItem from './MenuItem.jsx';
// import SubMenu from './SubMenu';

import { caliberArrayWithSplit } from '../../modules/format-ammo.mjs';
import categoryPages from '../../data/category-pages.json';
import useBossesData from '../../features/bosses/index.js';

import { mapIcons, useMapImagesSortedArray } from '../../features/maps/index.js';
import { setGameMode } from '../../features/settings/settingsSlice.mjs';

import alertConfig from './alert-config.js';

import IntersectionObserverWrapper from './intersection-observer-wrapper.js';

import './index.css';
import useTradersData from '../../features/traders/index.js';

// automatically selects the alert color
const alertColor = alertConfig.alertColors[alertConfig.alertLevel];

const ammoTypes = caliberArrayWithSplit();

const getAmmoMenu = (setIsOpen) => {
    const ammoMenu = ammoTypes.map((ammoType) => (
        <MenuItem
            checkbox
            displayText={ammoType}
            key={`menu-item-${ammoType}`}
            prefix="/ammo"
            to={`/ammo/${ammoType}`}
            //onClick={setIsOpen.bind(this, false)}
        />
    ));
    return ammoMenu;
};

const Menu = () => {
    /*const [isOpen, setIsOpen] = useState(false);
    const handleMenuClick = () => {
        setIsOpen(!isOpen);
    };*/
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [alertOpen, setAlertOpen] = useStateWithLocalStorage(alertConfig.bannerKey, true);
    const [alertStateOpen, setAlertStateOpen] = useState(alertOpen || alertConfig.alwaysShow);
    const gameMode = useSelector((state) => state.settings.gameMode);
    const loadingData = useSelector((state) => state.settings.loadingData);

    const otherGameMode = useMemo(() => {
        if (gameMode === 'regular') {
            return 'pve';
        }
        return 'regular';
    }, [gameMode]);

    const gameModeTranslated = useMemo(() => {
        return t(`game_mode_${gameMode}`);
    }, [gameMode, t]);

    const gameModeBadgeColor = useMemo(() => {
        const colors = {
            regular: 'success',
            pve: 'info',
        };
        return colors[gameMode] ?? 'warning';
    }, [gameMode]);

    const uniqueMaps = useMapImagesSortedArray();
    for (const map of uniqueMaps) {
        if (mapIcons[map.normalizedName]) {
            map.icon = mapIcons[map.normalizedName];
        }
        else {
            map.menuPadding = true;
        }
    }

    const { data: bosses } = useBossesData();
    const { data: allTraders } = useTradersData();

    const traders = useMemo(() => {
        return allTraders.filter(t => t.barters?.length > 0)
    }, [allTraders]);

    return (
        <>
            {/* ALERT BANNER SECTION */}
            {alertConfig?.alertEnabled === true && (
                <Box>
                <Collapse in={alertStateOpen}>
                    <Alert
                        severity={alertConfig.alertLevel}
                        variant='filled'
                        sx={{ backgroundColor: `${alertColor} !important`, borderRadius: '0px !important' }}
                        action={
                            <IconButton
                                aria-label="close"
                                color="inherit"
                                size="small"
                                onClick={() => {
                                    setAlertOpen(false);
                                    setAlertStateOpen(false);
                                }}
                            >
                                <Icon path={mdiClose} size={0.8} className="icon-with-text" />
                            </IconButton>
                        }
                    >
                        {t(alertConfig.text, alertConfig.textVariables)}

                        {alertConfig.linkEnabled === true && (
                            <>
                            <span>{' - '}</span>
                            <Link
                                to={alertConfig.link}
                                style={{ color: 'inherit', textDecoration: 'underline' }}
                                target="_blank"
                            >
                                {t(alertConfig.linkText)}
                            </Link>
                            </>
                        )}
                    </Alert>
                </Collapse>
            </Box>
            )}
            {/* END ALERT BANNER SECTION */}
            <nav key="main-navigation" className="navigation">
                <ul className={`menu`}>
                <IntersectionObserverWrapper>
                    <li key="menu-home" data-targetid="home" className="overflow-member">
                        <Badge badgeContent={loadingData ? <LinearProgress /> : gameModeTranslated} color={gameModeBadgeColor} style={{cursor: 'pointer'}} onClick={() => {
                            dispatch(setGameMode(otherGameMode));
                        }}>
                            <Link className="branding" to="/" onClick={(e) => {
                                e.stopPropagation();
                            }}>
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
                        </Badge>
                    </li>
                    <li className="submenu-wrapper overflow-member"  key="menu-settings" data-targetid="settings">
                        <Link
                            aria-label="Settings"
                            to="/settings/"
                            //onClick={setIsOpen.bind(this, false)}
                        >
                            <Icon
                                path={mdiCogOutline}
                                size={1}
                                className="icon-with-text"
                            />
                        </Link>
                    </li>
                    <li className="submenu-wrapper overflow-member"  key="menu-remote" data-targetid="remote">
                        <Link
                            aria-label="Remote control"
                            to="/control/"
                            //onClick={setIsOpen.bind(this, false)}
                        >
                            <Icon path={mdiRemote} size={1} className="icon-with-text" />
                        </Link>
                    </li>
                    <li className="submenu-wrapper overflow-member" key="menu-ammo" data-targetid="ammo">
                        <Link to="/ammo/">{t('Ammo')}</Link>
                        <ul style={{left: -20}} className="overflow-hidden">
                            {getAmmoMenu()}
                        </ul>
                    </li>
                    <li className="submenu-wrapper submenu-items overflow-member" key="menu-maps" data-targetid="maps">
                        <Link to="/maps/">{t('Maps')}</Link>
                        <ul style={{left: -40}}>
                            {Object.values(uniqueMaps.reduce((unique, map) => {
                                const sameMap = Object.values(unique).find(m => m.id === map.id);
                                if (!sameMap) {
                                    unique[map.id] = map;
                                    return unique;
                                }
                                if (map.projection === 'interactive') {
                                    unique[map.id] = map;
                                }
                                return unique;
                            }, {})).map((map) => (
                                <MenuItem
                                    displayText={map.name}
                                    key={`menu-item-${map.key}`}
                                    to={`/map/${map.key}`}
                                    icon={map.icon}
                                    padding={map.menuPadding}
                                    //onClick={setIsOpen.bind(this, false)}
                                />
                            ))}
                            <MenuItem
                                className="overflow-hidden"
                                displayText={`${t('More')}...`}
                                key={'menu-item-maps-more'}
                                to={'/maps'}
                            />
                        </ul>
                    </li>
                    <li className="submenu-wrapper submenu-items overflow-member" key="menu-items" data-targetid="items">
                        <Link to="/items/">{t('Items')}</Link>
                        <ul className="overflow-hidden">
                            {categoryPages.map((categoryPage) => (
                                <MenuItem
                                    displayText={t(categoryPage.displayText)}
                                    key={categoryPage.key}
                                    to={`/items/${categoryPage.key}`}
                                    //onClick={setIsOpen.bind(this, false)}
                                />
                            ))}
                        </ul>
                    </li>
                    <li className="submenu-wrapper submenu-items overflow-member" key="menu-traders" data-targetid="traders">
                        <Link to="/traders">{t('Traders')}</Link>
                        <ul>
                            {traders.map(trader => {
                                return (
                                    <MenuItem
                                        displayText={trader.name}
                                        key={`menu-item-${trader.normalizedName}`}
                                        to={`/trader/${trader.normalizedName}`}
                                        //onClick={setIsOpen.bind(this, false)}
                                    />
                                );
                            })}
                        </ul>
                    </li>
                    <li className="submenu-wrapper submenu-items overflow-member" key="menu-bosses" data-targetid="bosses">
                        <Link to="/bosses/">{t('Bosses')}</Link>
                        <ul>
                            {bosses.filter(boss => boss.maps.length > 0).sort((a,b) => a.name.localeCompare(b.name)).map(boss => {
                                return (
                                    <li key={`boss-${boss.normalizedName}`}><Link to={`/boss/${boss.normalizedName}`}>{boss.name}</Link></li>
                                );
                            })}
                        </ul>
                    </li>
                    <li className="submenu-wrapper submenu-items overflow-member" key="menu-barters" data-targetid="barters">
                        <Link 
                            to="/barters/" 
                            //onClick={setIsOpen.bind(this, false)}
                        >
                            {t('Barter profit')}
                        </Link>
                    </li>
                    <li className="submenu-wrapper submenu-items overflow-member" key="menu-hideout-profit" data-targetid="crafts">
                        <Link
                            to="/hideout-profit/"
                            //onClick={setIsOpen.bind(this, false)}
                        >
                            {t('Hideout profit')}
                        </Link>
                    </li>
                    <li className="submenu-wrapper submenu-items overflow-member" key="menu-tasks" data-targetid="tasks">
                        <Link
                            to="/tasks"
                            //onClick={setIsOpen.bind(this, false)}
                        >
                            {t('Tasks')}
                        </Link>
                    </li>
                    <li className="submenu-wrapper submenu-items overflow-member" key="menu-loot-tier" data-targetid="loot-tier">
                        <Link
                            to="/loot-tier/"
                            //onClick={setIsOpen.bind(this, false)}
                        >
                            {t('Loot tiers')}
                        </Link>
                    </li>
                    <li className="submenu-wrapper submenu-items overflow-member" key="menu-hideout-costs" data-targetid="hideout">
                        <Link
                            to="/hideout"
                            //onClick={setIsOpen.bind(this, false)}
                        >
                            {t('Hideout build costs')}
                        </Link>
                    </li>
                    <li className="submenu-wrapper submenu-items overflow-member" key="menu-wipe-length" data-targetid="wipe-length">
                        <Link
                            to="/wipe-length"
                            //onClick={setIsOpen.bind(this, false)}
                        >
                            {t('Wipe length')}
                        </Link>
                    </li>
                    <li className="submenu-wrapper submenu-items overflow-member" key="menu-bitcoin-farm" data-targetid="bitcoin">
                        <Link
                            to="/bitcoin-farm-calculator"
                            //onClick={setIsOpen.bind(this, false)}
                        >
                            {t('Bitcoin Farm Profit')}
                        </Link>
                    </li>
                    <li className="submenu-wrapper submenu-items overflow-member" key="menu-achievements" data-targetid="achievements">
                        <Link
                            to="/achievements"
                            //onClick={setIsOpen.bind(this, false)}
                        >
                            {t('Achievements')}
                        </Link>
                    </li>
                    <li className="submenu-wrapper submenu-items overflow-member" key="menu-players" data-targetid="players">
                        <Link
                            to="/players"
                            //onClick={setIsOpen.bind(this, false)}
                        >
                            {t('Players')}
                        </Link>
                    </li>
                    <li className="submenu-wrapper submenu-items overflow-member" key="menu-converter" data-targetid="converter">
                        <Link
                            to="/converter"
                            //onClick={setIsOpen.bind(this, false)}
                        >
                            {t('Currency Converter')}
                        </Link>
                    </li>
                    <li className="submenu-wrapper submenu-items overflow-member" key="menu-api" data-targetid="api">
                        <Link
                            to="/api/"
                            //onClick={setIsOpen.bind(this, false)}
                        >
                            {t('API')}
                        </Link>
                    </li>
                </IntersectionObserverWrapper>
                </ul>
            </nav>
        </>
    );
};

export default Menu;
