import { useState } from 'react';
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

import ammoData from '../../data/ammo.json';
import mapData from '../../data/maps.json';
import itemsData from '../../data/category-pages.json';

import './index.css';

// Comment / uncomment for banner alert
// import MuiAlert from '@material-ui/lab/Alert';
// function Alert(props) {
//     return <MuiAlert elevation={6} variant="filled" {...props} />;
// }
// End of banner alert toggle


const ammoTypes = [
    ...new Set(
        ammoData.data.map((ammoData) => {
            return ammoData.type;
        }),
    ),
].sort();

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
            {/* <><Alert severity="success">{"🌟 Flea market scanners have been leveled for this patch and all flea market data is now live! 🌟"}</Alert></> */}
            {/* END ALERT BANNER SECTION */}
            <nav key="main-navigation" className="navigation">
                <Icon
                    path={mdiMenu}
                    size={1}
                    className="mobile-icon"
                    onClick={handleMenuClick}
                    style={{
                        marginRight: 0,
                        marginLeft: 20,
                    }}
                />
                <Link className="branding" to="/">
                    {/* Tarkov.dev */}
                    <img
                        alt="Tarkov.dev"
                        height={30}
                        width={186}
                        src={`${process.env.PUBLIC_URL}/tarkov-dev-logo.svg`}
                        style={{ marginTop: 5, marginBottom: 5 }}
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
                    <li className="only-large">
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
                    <li className="submenu-wrapper">
                        <Link to="/" onClick={setIsOpen.bind(this, false)}>
                            {t('Home')}
                        </Link>
                    </li>
                    <li className="submenu-wrapper">
                        <Link to="/ammo/">{t('Ammo')}</Link>
                        <ul>
                            {ammoTypes.map((ammoType) => (
                                <MenuItem
                                    checkbox
                                    displayText={ammoType}
                                    key={ammoType}
                                    prefix="/ammo"
                                    to={`/ammo/${ammoType}`}
                                    onClick={setIsOpen.bind(this, false)}
                                />
                            ))}
                        </ul>
                    </li>
                    <li className="submenu-wrapper">
                        <Link to="/maps/">{t('Maps')}</Link>
                        <ul>
                            {mapData.map((map) => (
                                <MenuItem
                                    displayText={map.displayText}
                                    key={map.key}
                                    to={`/map/${map.key}`}
                                    onClick={setIsOpen.bind(this, false)}
                                />
                            ))}
                        </ul>
                    </li>
                    <li className="submenu-wrapper">
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
                    <li className="submenu-wrapper">
                        <Link to="/traders">{t('Traders')}</Link>
                        <ul>
                            <MenuItem
                                displayText={t('Prapor')}
                                to={`/traders/prapor`}
                                onClick={setIsOpen.bind(this, false)}
                            />
                            <MenuItem
                                displayText={t('Therapist')}
                                to={`/traders/therapist`}
                                onClick={setIsOpen.bind(this, false)}
                            />
                            <MenuItem
                                displayText={t('Skier')}
                                to={`/traders/skier`}
                                onClick={setIsOpen.bind(this, false)}
                            />
                            <MenuItem
                                displayText={t('Peacekeeper')}
                                to={`/traders/peacekeeper`}
                                onClick={setIsOpen.bind(this, false)}
                            />
                            <MenuItem
                                displayText={t('Mechanic')}
                                to={`/traders/mechanic`}
                                onClick={setIsOpen.bind(this, false)}
                            />
                            <MenuItem
                                displayText={t('Ragman')}
                                to={`/traders/ragman`}
                                onClick={setIsOpen.bind(this, false)}
                            />
                            <MenuItem
                                displayText={t('Jaeger')}
                                to={`/traders/jaeger`}
                                onClick={setIsOpen.bind(this, false)}
                            />
                        </ul>
                    </li>
                    <li className="submenu-wrapper">
                        <Link
                            to="/loot-tier/"
                            onClick={setIsOpen.bind(this, false)}
                        >
                            {t('Loot tiers')}
                        </Link>
                    </li>

                    <li className="submenu-wrapper">
                        <Link to="/barters/" onClick={setIsOpen.bind(this, false)}>
                            {t('Barter profit')}
                        </Link>
                    </li>
                    <li className="submenu-wrapper">
                        <Link
                            to="/hideout-profit/"
                            onClick={setIsOpen.bind(this, false)}
                        >
                            {t('Hideout profit')}
                        </Link>
                    </li>
                    <li className="submenu-wrapper">
                        <Link
                            to="/api/"
                            onClick={setIsOpen.bind(this, false)}
                        >
                            {t('API')}
                        </Link>
                    </li>
                    <li className="submenu-wrapper">
                        <Link
                            to="/stats/"
                            onClick={setIsOpen.bind(this, false)}
                        >
                            {t('stats')}
                        </Link>
                    </li>
                    <li className="submenu-wrapper desktop-only-link">
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
                    <li className="submenu-wrapper desktop-only-link">
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
