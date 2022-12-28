import { useMemo } from 'react';
//import { Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icon from '@mdi/react';
import {
    mdiCogOutline,
    mdiRemote,
} from '@mdi/js';

import MenuItem from './MenuItem';
//import SubMenu from './SubMenu';
// import PatreonButton from '../patreon-button';
import UkraineButton from '../ukraine-button';
//import LoadingSmall from '../loading-small';
//import { BossListNav } from '../boss-list';

import { caliberMap } from '../../modules/format-ammo';
import rawMapData from '../../data/maps.json';
import itemsData from '../../data/category-pages.json';
import { useMapsQuery } from '../../features/maps/queries';
import formatBossData from '../../modules/format-boss-data';

import IntersectionObserverWrapper from './intersection-observer-wrapper';

import './index.css';

// Comment / uncomment for banner alert
import MuiAlert from '@material-ui/lab/Alert';
function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}
// End of banner alert toggle

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
            //onClick={setIsOpen.bind(this, false)}
        />
    ));
    ammoMenu.splice(shotIndex+1, 0, (
        <MenuItem
            checkbox
            displayText="12 Gauge Slug"
            key="menu-item-12 Gauge Slug"
            prefix="/ammo"
            to="/ammo/12 Gauge Slug"
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

    const { data: maps } = useMapsQuery();

    const bosses = useMemo(() => {
        if (!maps || maps.length === 0) {
            return [];
        }
        return formatBossData(maps);
    }, [maps]);

    return (
        <>
            {/* ALERT BANNER SECTION - uncomment the lines below to enable the alert banner */}
            {/* severity can be 'error', 'info', 'success', or 'warning' */}
            <div><Alert severity="warning">{"Notice: Flea market scanners are currently being leveled and should be receiving data soon for this latest wipe"}</Alert></div>
            {/* END ALERT BANNER SECTION */}
            <nav key="main-navigation" className="navigation">
                <ul className={`menu`}>
                <IntersectionObserverWrapper>
                    <li key="menu-home" data-targetid="home">
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
                    </li>
                    <li className="submenu-wrapper"  key="menu-settings" data-targetid="settings">
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
                    <li className="submenu-wrapper"  key="menu-remote" data-targetid="remote">
                        <Link
                            aria-label="Remote control"
                            to="/control/"
                            //onClick={setIsOpen.bind(this, false)}
                        >
                            <Icon path={mdiRemote} size={1} className="icon-with-text" />
                        </Link>
                    </li>
                    <li className="submenu-wrapper" key="menu-ua-donate" data-targetid="ua-donate">
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
                    <li className="submenu-wrapper" key="menu-ammo" data-targetid="ammo">
                        <Link to="/ammo/">{t('Ammo')}</Link>
                        <ul>
                            {getAmmoMenu()}
                        </ul>
                    </li>
                    <li className="submenu-wrapper" key="menu-maps" data-targetid="maps">
                        <Link to="/maps/">{t('Maps')}</Link>
                        <ul>
                            {rawMapData.map((mapsGroup) => (
                                mapsGroup.maps.map((map) => (
                                    <MenuItem
                                        displayText={map.displayText}
                                        key={`menu-item-${map.key}`}
                                        to={`/map/${map.key}`}
                                        //onClick={setIsOpen.bind(this, false)}
                                    />
                                ))
                            ))}
                        </ul>
                    </li>
                    <li className="submenu-wrapper" key="menu-items" data-targetid="items">
                        <Link to="/items/">{t('Items')}</Link>
                        <ul>
                            {itemsData.map((categoryPage) => (
                                <MenuItem
                                    displayText={t(categoryPage.displayText)}
                                    key={categoryPage.key}
                                    to={`/items/${categoryPage.key}`}
                                    //onClick={setIsOpen.bind(this, false)}
                                />
                            ))}
                        </ul>
                    </li>
                    <li className="submenu-wrapper" key="menu-traders" data-targetid="traders">
                        <Link to="/traders">{t('Traders')}</Link>
                        <ul>
                            <MenuItem
                                displayText={t('Prapor')}
                                key="menu-item-prapor"
                                to={`/traders/prapor`}
                                //onClick={setIsOpen.bind(this, false)}
                            />
                            <MenuItem
                                displayText={t('Therapist')}
                                key="menu-item-therapist"
                                to={`/traders/therapist`}
                                //onClick={setIsOpen.bind(this, false)}
                            />
                            <MenuItem
                                displayText={t('Skier')}
                                key="menu-item-skier"
                                to={`/traders/skier`}
                                //onClick={setIsOpen.bind(this, false)}
                            />
                            <MenuItem
                                displayText={t('Peacekeeper')}
                                key="menu-item-peacekeeper"
                                to={`/traders/peacekeeper`}
                                //onClick={setIsOpen.bind(this, false)}
                            />
                            <MenuItem
                                displayText={t('Mechanic')}
                                key="menu-item-mechanic"
                                to={`/traders/mechanic`}
                                //onClick={setIsOpen.bind(this, false)}
                            />
                            <MenuItem
                                displayText={t('Ragman')}
                                key="menu-item-ragman"
                                to={`/traders/ragman`}
                                //onClick={setIsOpen.bind(this, false)}
                            />
                            <MenuItem
                                displayText={t('Jaeger')}
                                key="menu-item-jaeger"
                                to={`/traders/jaeger`}
                                //onClick={setIsOpen.bind(this, false)}
                            />
                        </ul>
                    </li>
                    <li className="submenu-wrapper" key="menu-bosses" data-targetid="bosses">
                        <Link to="/bosses/">{t('Bosses')}</Link>
                        <ul>
                            {bosses.map(boss => {
                                return (
                                    <li key={`boss-${boss.normalizedName}`}><Link to={`/boss/${boss.normalizedName}`}>{boss.name}</Link></li>
                                );
                            })}
                        </ul>
                    </li>
                    <li className="submenu-wrapper" key="menu-barters" data-targetid="barters">
                        <Link 
                            to="/barters/" 
                            //onClick={setIsOpen.bind(this, false)}
                        >
                            {t('Barter profit')}
                        </Link>
                    </li>
                    <li className="submenu-wrapper" key="menu-hideout-profit" data-targetid="crafts">
                        <Link
                            to="/hideout-profit/"
                            //onClick={setIsOpen.bind(this, false)}
                        >
                            {t('Hideout profit')}
                        </Link>
                    </li>
                    <li className="submenu-wrapper" key="menu-tasks" data-targetid="tasks">
                        <Link
                            to="/tasks"
                            //onClick={setIsOpen.bind(this, false)}
                        >
                            {t('Tasks')}
                        </Link>
                    </li>
                    <li className="submenu-wrapper" key="menu-loot-tier" data-targetid="loot-tier">
                        <Link
                            to="/loot-tier/"
                            //onClick={setIsOpen.bind(this, false)}
                        >
                            {t('Loot tiers')}
                        </Link>
                    </li>
                    <li className="submenu-wrapper" key="menu-hideout-costs" data-targetid="hideout">
                        <Link
                            to="/hideout"
                            //onClick={setIsOpen.bind(this, false)}
                        >
                            {t('Hideout build costs')}
                        </Link>
                    </li>
                    <li className="submenu-wrapper" key="menu-wipe-length" data-targetid="wipe-length">
                        <Link
                            to="/wipe-length"
                            //onClick={setIsOpen.bind(this, false)}
                        >
                            {t('Wipe length')}
                        </Link>
                    </li>
                    <li className="submenu-wrapper" key="menu-bitcoin-farm" data-targetid="bitcoin">
                        <Link
                            to="/bitcoin-farm-calculator"
                            //onClick={setIsOpen.bind(this, false)}
                        >
                            {t('Bitcoin Farm Profit')}
                        </Link>
                    </li>
                    <li className="submenu-wrapper" key="menu-api" data-targetid="api">
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
