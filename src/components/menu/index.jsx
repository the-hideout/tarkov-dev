import { useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage.jsx';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '@mdi/react';
import { mdiCogOutline, mdiRemote, mdiClose, mdiMenu } from '@mdi/js';
import { motion, AnimatePresence } from 'framer-motion';

import { Box, Alert, IconButton, Collapse, LinearProgress } from '@mui/material';

import { caliberArrayWithSplit } from '../../modules/format-ammo.mjs';
import categoryPages from '../../data/category-pages.json';
import useBossesData from '../../features/bosses/index.js';

import { mapIcons, useMapImagesSortedArray } from '../../features/maps/index.js';
import { setGameMode } from '../../features/settings/settingsSlice.mjs';

import alertConfig from './alert-config.js';
import useTradersData from '../../features/traders/index.js';
import CategoryMenu from './CategoryMenu.jsx';
import { getMenuData } from './menu-data.js';

import './index.css';

const alertColor = alertConfig.alertColors[alertConfig.alertLevel];
const ammoTypes = caliberArrayWithSplit();

const Menu = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [alertsClosed, setAlertsClosed] = useStateWithLocalStorage('alertBannersClosed', []);
    const [alertStateOpen, setAlertStateOpen] = useState(alertConfig.alwaysShow || !alertsClosed.includes(alertConfig.bannerKey));

    const gameMode = useSelector((state) => state.settings.gameMode);
    const loadingData = useSelector((state) => state.settings.loadingData);

    const otherGameMode = useMemo(() => {
        return gameMode === 'regular' ? 'pve' : 'regular';
    }, [gameMode]);

    const gameModeTranslated = useMemo(() => {
        return t(`game_mode_${gameMode}`);
    }, [gameMode, t]);

    const uniqueMaps = useMapImagesSortedArray();
    const processedMaps = useMemo(() => {
        // Deduplicate by id, prioritizing interactive projection
        const deduplicated = uniqueMaps.reduce((acc, map) => {
            const existing = acc[map.id];
            if (!existing || map.projection === 'interactive') {
                acc[map.id] = map;
            }
            return acc;
        }, {});

        const maps = Object.values(deduplicated);

        for (const map of maps) {
            if (mapIcons[map.normalizedName]) {
                map.icon = mapIcons[map.normalizedName];
            } else {
                map.menuPadding = true;
            }
        }
        return maps;
    }, [uniqueMaps]);

    const { data: bosses } = useBossesData();
    const { data: allTraders } = useTradersData();

    const traders = useMemo(() => {
        return allTraders.filter((t) => t.barters?.length > 0);
    }, [allTraders]);

    const menuData = useMemo(
        () =>
            getMenuData(t, {
                traders,
                bosses,
                uniqueMaps: processedMaps,
                categoryPages,
            }),
        [t, traders, bosses, processedMaps],
    );

    return (
        <>
            {alertConfig?.alertEnabled === true && (
                <Box>
                    <Collapse in={alertStateOpen}>
                        <Alert
                            severity={alertConfig.alertLevel}
                            variant="filled"
                            sx={{
                                backgroundColor: `${alertColor} !important`,
                                borderRadius: '0px !important',
                            }}
                            action={
                                <IconButton
                                    aria-label="close"
                                    color="inherit"
                                    size="small"
                                    onClick={() => {
                                        if (!alertsClosed.includes(alertConfig.bannerKey)) {
                                            setAlertsClosed([...alertsClosed, alertConfig.bannerKey]);
                                        }
                                        setAlertStateOpen(false);
                                    }}
                                >
                                    <Icon path={mdiClose} size={0.8} />
                                </IconButton>
                            }
                        >
                            {t(alertConfig.text, alertConfig.textVariables)}
                            {alertConfig.linkEnabled === true && (
                                <>
                                    <span>{' - '}</span>
                                    <Link to={alertConfig.link} style={{ color: 'inherit', textDecoration: 'underline' }} target="_blank">
                                        {t(alertConfig.linkText)}
                                    </Link>
                                </>
                            )}
                        </Alert>
                    </Collapse>
                </Box>
            )}

            <nav className="navigation-container">
                <div className="nav-content">
                    <div className="nav-left">
                        <div className="branding-section">
                            <Link className="branding" to="/">
                                <img alt="Tarkov.dev" height={30} src={`${process.env.PUBLIC_URL}/tarkov-dev-logo.svg`} className="logo" loading="lazy" />
                            </Link>
                            <div className={`game-mode-toggle ${gameMode}`} onClick={() => dispatch(setGameMode(otherGameMode))} title={t('Click to switch game mode')}>
                                {loadingData ? <LinearProgress sx={{ width: 20, height: 2 }} /> : gameModeTranslated}
                            </div>
                        </div>

                        <ul className="desktop-menu">
                            {menuData.map((category) => (
                                <CategoryMenu key={category.id} title={category.text} items={category.items} to={category.to} />
                            ))}
                        </ul>
                    </div>

                    <div className="nav-right">
                        <Link aria-label="Settings" to="/settings/" className="nav-icon-link">
                            <Icon path={mdiCogOutline} size={1} />
                        </Link>
                        <Link aria-label="Remote control" to="/control/" className="nav-icon-link">
                            <Icon path={mdiRemote} size={1} />
                        </Link>
                        <IconButton className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            <Icon path={isMobileMenuOpen ? mdiClose : mdiMenu} size={1} />
                        </IconButton>
                    </div>
                </div>

                {/* Mobile Menu Drawer */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="mobile-drawer-backdrop" />
                            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 380 }} className="mobile-menu-drawer">
                                <div className="mobile-drawer-header">
                                    <span className="mobile-drawer-title">{t('Menu')}</span>
                                    <IconButton onClick={() => setIsMobileMenuOpen(false)} className="mobile-close-button" sx={{ color: 'var(--accent-gold) !important' }}>
                                        <Icon path={mdiClose} size={1} />
                                    </IconButton>
                                </div>
                                <div className="mobile-drawer-content">
                                    <ul className="mobile-menu-list">
                                        {menuData.map((category) => (
                                            <li key={category.id} className="mobile-category">
                                                <div className="mobile-category-title">{category.text}</div>
                                                <ul className="mobile-category-items">
                                                    {category.items.map((item, idx) => {
                                                        if (item.items?.length) {
                                                            return (
                                                                <li key={idx} className="mobile-nested-section">
                                                                    <div className="mobile-nested-title">{item.text}</div>
                                                                    <ul className="mobile-nested-items">
                                                                        {item.items.map((subItem, sIdx) => (
                                                                            <li key={sIdx}>
                                                                                <Link to={subItem.to} onClick={() => setIsMobileMenuOpen(false)}>
                                                                                    {subItem.text}
                                                                                </Link>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </li>
                                                            );
                                                        }
                                                        return (
                                                            <li key={idx}>
                                                                <Link to={item.to} onClick={() => setIsMobileMenuOpen(false)}>
                                                                    {item.text}
                                                                </Link>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </nav>
        </>
    );
};

export default Menu;
