/* eslint-disable no-restricted-globals */
import React, { useEffect, useCallback, useRef, Suspense } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useDispatch, useSelector } from 'react-redux';
import CookieConsent from "react-cookie-consent";
import { ErrorBoundary } from "react-error-boundary";

import './App.css';

import i18n from './i18n.js';
import loadPolyfills from './modules/polyfills.js';

import RemoteControlId from './components/remote-control-id/index.jsx';
import { fetchTarkovTrackerProgress, setPlayerPosition } from './features/settings/settingsSlice.js';

import {
    setConnectionStatus,
    enableConnection,
} from './features/sockets/socketsSlice.js';
import useStateWithLocalStorage from './hooks/useStateWithLocalStorage.jsx';
import makeID from './modules/make-id.js';

import Loading from './components/loading/index.js';

import supportedLanguages from './data/supported-languages.json';

import Menu from './components/menu/index.js';
import Footer from './components/footer/index.js';

const Map = React.lazy(() => import('./pages/map/index.js'));
const ErrorPage = React.lazy(() => import('./pages/error-page/index.js'));
const Debug = React.lazy(() => import('./components/Debug.jsx'));

const Ammo = React.lazy(() => import('./pages/ammo/index.js'));
const Control = React.lazy(() => import('./pages/control/index.js'));
const LootTiers = React.lazy(() => import('./pages/loot-tiers/index.js'));
const Barters = React.lazy(() => import('./pages/barters/index.js'));
const Maps = React.lazy(() => import('./pages/maps//index.js'));
const Crafts = React.lazy(() => import('./pages/crafts/index.js'));
const Item = React.lazy(() => import('./pages/item/index.js'));
const Start = React.lazy(() => import('./pages/start/index.js'));
const Settings = React.lazy(() => import('./pages/settings/index.js'));
const Nightbot = React.lazy(() => import('./pages/nightbot/index.js'));
const StreamElements = React.lazy(() => import('./pages/stream-elements/index.js'));
const ApiUsers = React.lazy(() => import('./pages/api-users/index.js'));
const Moobot = React.lazy(() => import('./pages/moobot/index.js'));

const Items = React.lazy(() => import('./pages/items/index.js'));
const Armors = React.lazy(() => import('./pages/items/armors/index.js'));
const Backpacks = React.lazy(() => import('./pages/items/backpacks/index.js'));
const BarterItems = React.lazy(() => import('./pages/items/barter-items/index.js'));
const Containers = React.lazy(() => import('./pages/items/containers/index.js'));
const Glasses = React.lazy(() => import('./pages/items/glasses/index.js'));
const Grenades = React.lazy(() => import('./pages/items/grenades/index.js'));
const Guns = React.lazy(() => import('./pages/items/guns/index.js'));
const Headsets = React.lazy(() => import('./pages/items/headsets/index.js'));
const Helmets = React.lazy(() => import('./pages/items/helmets/index.js'));
const Keys = React.lazy(() => import('./pages/items/keys/index.js'));
const Mods = React.lazy(() => import('./pages/items/mods/index.js'));
const PistolGrips = React.lazy(() => import('./pages/items/pistol-grips/index.js'));
const Provisions = React.lazy(() => import('./pages/items/provisions/index.js'));
const Rigs = React.lazy(() => import('./pages/items/rigs/index.js'));
const Suppressors = React.lazy(() => import('./pages/items/suppressors/index.js'));
const BsgCategory = React.lazy(() => import('./pages/items/bsg-category/index.js'));
const BitcoinFarmCalculator = React.lazy(() => import('./pages/bitcoin-farm-calculator/index.js'));
const Quests = React.lazy(() => import('./pages/quests/index.js'));
const Quest = React.lazy(() => import('./pages/quest/index.js'));

const Bosses = React.lazy(() => import('./pages/bosses/index.js'));
const Boss = React.lazy(() => import('./pages/boss/index.js'));

const Traders = React.lazy(() => import('./pages/traders/index.js'));
const Trader = React.lazy(() => import('./pages/trader/index.js'));

const ItemTracker = React.lazy(() => import('./pages/item-tracker/index.js'));
const Hideout = React.lazy(() => import('./pages/hideout/index.js'));
const WipeLength = React.lazy(() => import('./pages/wipe-length/index.js'));
const Achievements = React.lazy(() => import('./pages/achievements/index.js'));
const Players = React.lazy(() => import('./pages/players/index.js'));
const Player = React.lazy(() => import('./pages/player/index.js'));
const PlayerForward = React.lazy(() => import('./pages/player/player-forward.js'));
const Converter = React.lazy(() => import('./pages/converter/index.js'));
const About = React.lazy(() => import('./pages/about/index.js'));

const APIDocs = React.lazy(() => import('./pages/api-docs/index.js'));

const socketServer = 'wss://socket.tarkov.dev';
//const socketServer = 'ws://localhost:8080';

let socket = false;

loadPolyfills();

function Fallback({ error, resetErrorBoundary }) {
    return (
        <div className="display-wrapper" style={{minHeight: "40vh"}} key="fallback-wrapper">
            <h1 className="center-title">
                Something went wrong.
            </h1>
            <div className="page-wrapper" style={{minHeight: "40vh"}}>
                <details style={{ whiteSpace: 'pre-wrap' }}>
                    <pre style={{ color: "red" }}>{error.message}</pre>
                    <pre>{error.stack}</pre>
                    You can <button style={{ padding: '.2rem', borderRadius: '4px' }} onClick={resetErrorBoundary}>try again</button> or report the issue by
                    joining our <a href="https://discord.gg/WwTvNe356u" target="_blank" rel="noopener noreferrer">Discord</a> server and 
                    copy/paste the above error and some details in <a href="https://discord.com/channels/956236955815907388/956239773742288896" target="_blank" rel="noopener noreferrer">#🐞bugs-issues</a> channel.
                </details>
            </div>
        </div>
    );
}

function App() {
    const connectToId = new URLSearchParams(window.location.search).get(
        'connection',
    );
    if (connectToId) {
        localStorage.setItem('sessionId', JSON.stringify(connectToId));
    }
    const [sessionID] = useStateWithLocalStorage('sessionId', makeID(4));
    const socketEnabled = useSelector((state) => state.sockets.enabled);
    const controlId = useSelector((state) => state.sockets.controlId);
    let navigate = useNavigate();
    const dispatch = useDispatch();
    const retrievedTarkovTrackerToken = useRef(false);
    const tarkovTrackerProgressInterval = useRef(false);
    const tarkovTrackerUpdatePending = useRef(false);
    const tabHasFocus = useRef(true);

    if (connectToId) {
        dispatch(enableConnection());
    }

    const useTarkovTracker = useSelector(
        (state) => state.settings[state.settings.gameMode].useTarkovTracker,
    );

    const progressStatus = useSelector((state) => {
        return state.settings.progressStatus;
    });

    const tarkovTrackerAPIKey = useSelector(
        (state) => state.settings[state.settings.gameMode].tarkovTrackerAPIKey,
    );

    const updateTarkovTrackerData = useCallback(() => {
        tarkovTrackerUpdatePending.current = false;
        retrievedTarkovTrackerToken.current = tarkovTrackerAPIKey;
        dispatch(fetchTarkovTrackerProgress(tarkovTrackerAPIKey));
    }, [dispatch, tarkovTrackerAPIKey]);

    const scheduleTarkovTrackerUpdate = useCallback(() => {
        clearInterval(tarkovTrackerProgressInterval.current);
        tarkovTrackerProgressInterval.current = setInterval(() => {
            if (!tabHasFocus.current) {
                // window doesn't have focus, so postpone the update until it does
                tarkovTrackerUpdatePending.current = true;
                return;
            }
            updateTarkovTrackerData();
        }, 1000 * 60 * 5);
    }, [updateTarkovTrackerData]);

    // monitor window focus for Tarkov Tracker updates
    useEffect(() => {
        const handleFocus = () => {
            tabHasFocus.current = true;
            if (!tarkovTrackerUpdatePending.current) {
                return;
            }
            scheduleTarkovTrackerUpdate();
            updateTarkovTrackerData();
        };
    
        const handleBlur = () => {
            tabHasFocus.current = false;
        };
    
        window.addEventListener('focus', handleFocus);
        window.addEventListener('blur', handleBlur);
    
        // Clean up
        return () => {
          window.removeEventListener('focus', handleFocus);
          window.removeEventListener('blur', handleBlur);
        };
      }, [scheduleTarkovTrackerUpdate, updateTarkovTrackerData]);

    useEffect(() => {
        if (!tarkovTrackerProgressInterval.current && useTarkovTracker) {
            scheduleTarkovTrackerUpdate();
        }

        if (useTarkovTracker && progressStatus !== 'loading' && retrievedTarkovTrackerToken.current !== tarkovTrackerAPIKey) {
            updateTarkovTrackerData();
        }

        if (tarkovTrackerProgressInterval.current && !useTarkovTracker) {
            clearInterval(tarkovTrackerProgressInterval.current);
            tarkovTrackerProgressInterval.current = false;
        }

        return () => {
            clearInterval(tarkovTrackerProgressInterval.current);
            tarkovTrackerProgressInterval.current = false;
        };
    }, [progressStatus, scheduleTarkovTrackerUpdate, updateTarkovTrackerData, tarkovTrackerAPIKey, useTarkovTracker]);

    useEffect(() => {
        const handleDisplayMessage = (rawMessage) => {
            const message = JSON.parse(rawMessage.data);

            if (message.type !== 'command') {
                return false;
            }

            if (message.data.type === 'playerPosition') {
                dispatch(setPlayerPosition(message.data));
                return false;
            }

            navigate(`/${message.data.type}/${message.data.value}`);
        };

        const connect = function connect() {
            socket = new WebSocket(socketServer + `?sessionid=${encodeURIComponent(sessionID)}`);

            const heartbeat = function heartbeat() {
                clearTimeout(socket.pingTimeout);

                // Use `WebSocket#terminate()`, which immediately destroys the connection,
                // instead of `WebSocket#close()`, which waits for the close timer.
                // Delay should be equal to the interval at which your server
                // sends out pings plus a conservative assumption of the latency.
                socket.pingTimeout = setTimeout(() => {
                    if (socket && socket.terminate) {
                        socket.terminate();
                    }
                    dispatch(setConnectionStatus(false));
                }, 40000 + 1000);
            };

            socket.addEventListener('message', (rawMessage) => {
                const message = JSON.parse(rawMessage.data);

                if (message.type === 'ping') {
                    heartbeat();

                    socket.send(JSON.stringify({ type: 'pong' }));

                    return true;
                }

                handleDisplayMessage(rawMessage);
            });

            socket.addEventListener('open', () => {
                console.log('Connected to socket server');
                //console.log(socket);

                heartbeat();

                dispatch(setConnectionStatus(true));
            });

            socket.addEventListener('close', () => {
                console.log('Disconnected from socket server');

                dispatch(setConnectionStatus(false));

                clearTimeout(socket.pingTimeout);
            });

            setInterval(() => {
                if (socket.readyState === 3 && socketEnabled) {
                    console.log('trying to re-connect');
                    connect();
                }
            }, 5000);
        };

        if (socket === false && socketEnabled) {
            connect();
        }

        return () => {
            // socket.terminate();
        };
    }, [socketEnabled, sessionID, navigate, dispatch]);

    const send = useCallback(
        (messageData) => {
            if (socket.readyState !== 1) {
                // Wait a bit if we're not connected
                setTimeout(() => {
                    socket.send(
                        JSON.stringify({
                            sessionID: controlId,
                            ...messageData,
                        }),
                    );
                }, 500);

                return true;
            }

            socket.send(
                JSON.stringify({
                    sessionID: controlId,
                    ...messageData,
                }),
            );
        },
        [controlId],
    );

    const hideRemoteControlId = useSelector(
        (state) => state.settings.hideRemoteControl,
    );
    const remoteControlSessionElement = hideRemoteControlId ? null : (
        <Suspense fallback={<Loading />} key="suspense-connection-wrapper">
            <RemoteControlId
                key="connection-wrapper"
                sessionID={sessionID}
                socketEnabled={socketEnabled}
                onClick={(e) => dispatch(enableConnection())}
            />
        </Suspense>
    );
    const alternateLangs = supportedLanguages.filter(lang => lang !== i18n.language);

    return (
        <div className="App">
            <Helmet htmlAttributes={{ lang: i18n.language }}>
                <meta property="og:locale" content={i18n.language} key="meta-locale" />
                {alternateLangs.map((lang) => (
                    <meta property="og:locale:alternate" content={lang} key={`meta-locale-alt-${lang}`} />
                ))}
            </Helmet>
            <Menu />
            <CookieConsent>
                tarkov.dev uses cookies to enhance your experience. By continuing to use this site, you agree to the usage of cookies. Cookies are used to remember your settings and features that you enable.
            </CookieConsent>
            <ErrorBoundary FallbackComponent={Fallback}>
                <Routes>
                    <Route
                        path={'/'}
                        key="start-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-start-wrapper">
                                <Start key="start-wrapper" />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/ammo'}
                        key="ammo-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-ammo-wrapper">
                                <Ammo key="ammo-wrapper" />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/ammo/:currentAmmo'}
                        key="ammo-current-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-ammo-wrapper">
                                <Ammo key="ammo-wrapper" />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/maps/'}
                        key="maps-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-maps-wrapper">
                                <Maps key="maps-wrapper" />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/map/:currentMap'}
                        key="map-current-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-map-wrapper">
                                <Map key="map-wrapper" />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/loot-tier'}
                        key="loot-tier-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-loot-tier-wrapper">
                                <LootTiers key="loot-tier-wrapper" />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/barters'}
                        key="barters-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-barters-wrapper">
                                <Barters key="barters-wrapper" />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/barter'}
                        key="barter-route"
                        element={[
                            <Navigate to="/barters" />,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/items'}
                        key="items-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-items-wrapper">
                                <Items key="items-wrapper" />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/item'}
                        key="item-route"
                        element={[
                            <Navigate to="/items" />,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/items/ammo'}
                        key="items-ammo-route"
                        element={[
                            <Navigate to="/ammo" />,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/items/helmets'}
                        key="helmets-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-helmets-wrapper">
                                <Helmets key="helmets-wrapper" />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/items/glasses'}
                        key="glasses-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-glasses-wrapper">
                                <Glasses key="glasses-wrapper" />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/items/armors'}
                        key="armors-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-armors-wrapper">
                                <Armors key="armors-wrapper" />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/items/backpacks'}
                        key="backpacks-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-backpacks-wrapper">
                                <Backpacks key="backpacks-wrapper" />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/items/backpack'}
                        key="backpack-route"
                        element={[
                            <Navigate to="/items/backpacks" />,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/items/rigs'}
                        key="rigs-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-rigs-wrapper">
                                <Rigs key="rigs-wrapper" />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/items/chest-rig'}
                        key="chest-rig-route"
                        element={[
                            <Navigate to="/items/rigs" />,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/items/suppressors'}
                        key="suppressors-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-suppressors-wrapper">
                                <Suppressors key="suppressors-wrapper" />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/items/silencer'}
                        key="silencer-route"
                        element={[
                            <Navigate to="/items/suppressors" />,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/items/guns'}
                        key="guns-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-guns-wrapper">
                                <Guns key="guns-wrapper" />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/items/mods'}
                        key="mods-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-mods-wrapper">
                                <Mods key="mods-wrapper" />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/items/weapon-mod'}
                        key="weapon-mod-route"
                        element={[
                            <Navigate to="/items/mods" />,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/items/pistol-grips'}
                        key="pistol-grips-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-pistol-grips-wrapper">
                                <PistolGrips key="pistol-grips-wrapper" />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/items/barter-items'}
                        key="barter-items-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-barter-items-wrapper">
                                <BarterItems key="barter-items-wrapper" />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/items/containers'}
                        key="containers-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-containers-wrapper">
                                <Containers key="containers-wrapper" />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/items/common-container'}
                        key="common-container-route"
                        element={[
                            <Navigate to="/items/containers" />,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/items/grenades'}
                        key="grenades-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-grenades-wrapper">
                                <Grenades key="grenades-wrapper" />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/items/throwable-weapon'}
                        key="throwable-weapon-route"
                        element={[
                            <Navigate to="/items/grenades" />,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/items/headsets'}
                        key="headsets-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-headsets-wrapper">
                                <Headsets key="headsets-wrapper" />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/items/headphones'}
                        key="headphones-route"
                        element={[
                            <Navigate to="/items/headsets" />,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/items/keys'}
                        key="keys-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-keys-wrapper">
                                <Keys key="keys-wrapper" />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/items/key'}
                        key="key-route"
                        element={[
                            <Navigate to="/items/keys" />,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/items/provisions'}
                        key="provisions-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-provisions-wrapper">
                                <Provisions key="provisions-wrapper" />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/items/food-and-drink'}
                        key="food-and-drink-route"
                        element={[
                            <Navigate to="/items/provisions" />,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path="/items/:bsgCategoryName"
                        key="items-category-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-items-category-wrapper">
                                <BsgCategory />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/item/:itemName'}
                        key="item-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-item-wrapper">
                                <Item key="item-wrapper" />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/bosses'}
                        key="bosses-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-bosses-wrapper">
                                <Bosses key="bosses-wrapper" />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/boss'}
                        key="boss-route"
                        element={[
                            <Navigate to="/bosses" />,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/boss/:bossName'}
                        key="boss-name-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-boss-wrapper">
                                <Boss key="boss-wrapper" />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/traders'}
                        key="traders-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-traders-wrapper">
                                <Traders key="traders-wrapper" />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/trader'}
                        key="trader-route"
                        element={[
                            <Navigate to="/traders" />,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/trader/:traderName'}
                        key="trader-name-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-trader-wrapper">
                                <Trader key="trader-wrapper" />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/hideout-profit/'}
                        key="hideout-profit-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-hideout-profit-wrapper">
                                <Crafts key="hideout-profit-wrapper" />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/item-tracker/'}
                        key="item-tracker-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-item-tracker-wrapper">
                                <ItemTracker key="item-tracker-wrapper" />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/debug/'}
                        key="debug-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-debug-wrapper">
                                <Debug key="debug-wrapper" />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/about'}
                        key="about-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-about-wrapper">
                                <About key="about-wrapper" />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/api/'}
                        key="api-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-api-docs-wrapper">
                                <APIDocs key="api-docs-wrapper" />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/nightbot/'}
                        key="nightbot-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-nightbot-wrapper">
                                <Nightbot />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/streamelements/'}
                        key="streamelements-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-streamelements-wrapper">
                                <StreamElements />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/moobot'}
                        key="moobot-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-moobot-wrapper">
                                <Moobot />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/api-users/'}
                        key="api-users-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-api-users-wrapper">
                                <ApiUsers />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/hideout'}
                        key="hideout-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-hideout-wrapper">
                                <Hideout key="hideout-wrapper" />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/wipe-length'}
                        key="wipe-length-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-wipe-length-wrapper">
                                <WipeLength key="wipe-length-wrapper" />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/bitcoin-farm-calculator'}
                        key="bitcoin-farm-calculator-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-bitcoin-farm-wrapper">
                                <BitcoinFarmCalculator key="bitcoin-farm-calculator" />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/settings/'}
                        key="settings-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-settings-wrapper">
                                <Settings key="settings-wrapper" />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/control'}
                        key="control-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-control-wrapper">
                                <Control send={send} />
                            </Suspense>,
                        ]}
                    />
                    <Route
                        path={'/tasks/'}
                        key="tasks-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-tasks-wrapper">
                                <Quests key="tasks-wrapper" />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/task/:taskIdentifier'}
                        key="task-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-task-wrapper">
                                <Quest key="task-wrapper" />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/achievements'}
                        key="achievements-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-achievements-wrapper">
                                <Achievements key="achievements-wrapper" />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/players'}
                        key="players-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-players-wrapper">
                                <Players key="players-wrapper" />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path="/players/:gameMode/:accountId"
                        key="player-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-player-wrapper">
                                <Player />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path="/player/:accountId"
                        key="player-regular-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-player-forward-wrapper">
                                <PlayerForward />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/converter'}
                        key="converter-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-converter-wrapper">
                                <Converter key="converter-wrapper" />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path="*"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-errorpage-wrapper">
                                <ErrorPage />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                </Routes>
            </ErrorBoundary>
            <Footer />
        </div>
    );
}

export default App;
