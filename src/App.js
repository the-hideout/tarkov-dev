/* eslint-disable no-restricted-globals */
import React, { useEffect, useCallback, Suspense } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useDispatch, useSelector } from 'react-redux';

import './App.css';
import i18n from './i18n';
import loadPolyfills from './modules/polyfills';

import Map from './components/Map.jsx';
import RemoteControlId from './components/remote-control-id';
import Menu from './components/menu';
import Footer from './components/footer';
import { fetchTarkovTrackerProgress } from './features/settings/settingsSlice';

import {
    setConnectionStatus,
    enableConnection,
} from './features/sockets/socketsSlice';
import useStateWithLocalStorage from './hooks/useStateWithLocalStorage';
import makeID from './modules/make-id';

import Ammo from './pages/ammo';
import Control from './pages/control';
import LootTiers from './pages/loot-tiers';
import Barters from './pages/barters';
import Maps from './pages/maps/';
import Crafts from './pages/crafts';
import Item from './pages/item';
import Start from './pages/start';
import Settings from './pages/settings';
import Nightbot from './pages/nightbot';
import StreamElements from './pages/stream-elements';
import ApiUsers from './pages/api-users';
import Moobot from './pages/moobot';

import Items from './pages/items/';
import Armors from './pages/items/armors';
import Backpacks from './pages/items/backpacks';
import BarterItems from './pages/items/barter-items';
import Containers from './pages/items/containers';
import Glasses from './pages/items/glasses';
import Grenades from './pages/items/grenades';
import Guns from './pages/items/guns';
import Headsets from './pages/items/headsets';
import Helmets from './pages/items/helmets';
import Keys from './pages/items/keys';
import Mods from './pages/items/mods';
import PistolGrips from './pages/items/pistol-grips';
import Provisions from './pages/items/provisions';
import Rigs from './pages/items/rigs';
import Suppressors from './pages/items/suppressors';
import BsgCategory from './pages/items/bsg-category';
import BitcoinFarmCalculator from './pages/bitcoin-farm-calculator';
import Quests from './pages/quests';
import Quest from './pages/quest';

import Bosses from './pages/bosses';
import Boss from './pages/bosses/boss';

import Trader from './pages/traders/trader';
import Traders from './pages/traders';

import ItemTracker from './pages/item-tracker/';
import Hideout from './pages/hideout';
import WipeLength from './pages/wipe-length';
import About from './pages/about/';

import Guides from './pages/guides';

import ErrorPage from './components/error-page';
import Loading from './components/loading';
import Debug from './components/Debug';

import supportedLanguages from './data/supported-languages.json';

const APIDocs = React.lazy(() => import('./pages/api-docs'));
// import APIDocs from './pages/api-docs';

const socketServer = `wss://socket.tarkov.dev`;

let socket = false;
let tarkovTrackerProgressInterval = false;

loadPolyfills();

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

    if (connectToId) {
        dispatch(enableConnection());
    }

    const useTarkovTracker = useSelector(
        (state) => state.settings.useTarkovTracker,
    );
    
    const progressStatus = useSelector((state) => {
        return state.settings.progressStatus;
    });

    const tarkovTrackerAPIKey = useSelector(
        (state) => state.settings.tarkovTrackerAPIKey,
    );

    useEffect(() => {
        if (useTarkovTracker && progressStatus !== 'loading' && !tarkovTrackerProgressInterval) {
            dispatch(fetchTarkovTrackerProgress(tarkovTrackerAPIKey));
        }

        if (!tarkovTrackerProgressInterval && useTarkovTracker) {
            tarkovTrackerProgressInterval = setInterval(() => {
                dispatch(fetchTarkovTrackerProgress(tarkovTrackerAPIKey));
            }, 1000 * 60 * 5);
        }

        if (tarkovTrackerProgressInterval && !useTarkovTracker) {
            clearInterval(tarkovTrackerProgressInterval);
            tarkovTrackerProgressInterval = false;
        }

        return () => {
            clearInterval(tarkovTrackerProgressInterval);
        };
    }, [progressStatus, dispatch, tarkovTrackerAPIKey, useTarkovTracker]);

    useEffect(() => {
        const handleDisplayMessage = (rawMessage) => {
            const message = JSON.parse(rawMessage.data);

            if (message.type !== 'command') {
                return false;
            }

            navigate(`/${message.data.type}/${message.data.value}`);
        };

        const connect = function connect() {
            socket = new WebSocket(socketServer);

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
                console.log(socket);

                heartbeat();

                dispatch(setConnectionStatus(true));

                socket.send(
                    JSON.stringify({
                        sessionID: sessionID,
                        type: 'connect',
                    }),
                );
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
                        JSON.stringify({ sessionID: controlId,
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
        <RemoteControlId
            key="connection-wrapper"
            sessionID={sessionID}
            socketEnabled={socketEnabled}
            onClick={(e) => dispatch(enableConnection())}
        />
    );
    const alternateLangs = supportedLanguages.filter(lang => lang !== i18n.language); 

    // dayjs locale needs to be loaded so it output localized text, but this suggested method throws a loader error...
    // maybe we should use i18n DateTime and RelativeTime instead
    //require(`dayjs/locale/${i18n.language}`)

    return (
        <div className="App">
            <Helmet htmlAttributes={{ lang: i18n.language }}>
                <meta property="og:locale" content={i18n.language} />
                {alternateLangs.map((lang) => (
                    <meta property="og:locale:alternate" content={lang} />
                ))}
            </Helmet>
            <Menu />
            {/* <Suspense fallback={<Loading />}> */}
            <Routes>
                <Route
                    path={'/'}
                    key="start-route"
                    element={[
                        <Start key="start-wrapper" />,
                        remoteControlSessionElement,
                    ]}
                />
                <Route
                    path={'/ammo'}
                    key="ammo-route"
                    element={[
                        <Ammo key="ammo-wrapper" />,
                        remoteControlSessionElement,
                    ]}
                />
                <Route
                    path={'/ammo/:currentAmmo'}
                    key="ammo-current-route"
                    element={[
                        <Ammo key="ammo-wrapper" />,
                        remoteControlSessionElement,
                    ]}
                />
                <Route
                    path={'/maps/'}
                    key="maps-route"
                    element={[
                        <Maps key="maps-wrapper" />,
                        remoteControlSessionElement,
                    ]}
                />
                <Route
                    path={'/map/:currentMap'}
                    key="map-current-route"
                    element={[
                        <Map key="map-wrapper" />,
                        remoteControlSessionElement,
                    ]}
                />
                <Route
                    path={'/barter'}
                    key="barter-route"
                    element={[
                        <LootTiers sessionID={sessionID} key="barter-wrapper" />,
                        remoteControlSessionElement,
                    ]}
                />
                <Route
                    path={'/loot-tier/:currentLoot'}
                    key="loot-tier-current-route"
                    element={[
                        <LootTiers sessionID={sessionID} key="loot-tier-current-wrapper" />,
                        remoteControlSessionElement,
                    ]}
                />
                <Route
                    path={'/loot-tier'}
                    key="loot-tier-route"
                    element={[
                        <LootTiers sessionID={sessionID} key="loot-tier-wrapper" />,
                        remoteControlSessionElement,
                    ]}
                />
                <Route
                    path={'/barters/'}
                    key="barters-route"
                    element={[
                        <Barters key="barters-wrapper" />,
                        remoteControlSessionElement,
                    ]}
                />
                <Route
                    path={'/items/'}
                    key="items-route"
                    element={[
                        <Items key="items-wrapper" />,
                        remoteControlSessionElement,
                    ]}
                />
                <Route
                    path={'/items/helmets'}
                    key="helmets-route"
                    element={[
                        <Helmets sessionID={sessionID} key="helmets-wrapper" />,
                        remoteControlSessionElement,
                    ]}
                />

                <Route
                    path={'/items/glasses'}
                    key="glasses-route"
                    element={[
                        <Glasses sessionID={sessionID} key="glasses-wrapper" />,
                        remoteControlSessionElement,
                    ]}
                />
                <Route
                    path={'/items/armors'}
                    key="armors-route"
                    element={[
                        <Armors sessionID={sessionID} key="armors-wrapper" />,
                        remoteControlSessionElement,
                    ]}
                />
                <Route
                    path={'/items/backpacks'}
                    key="backpacks-route"
                    element={[
                        <Backpacks sessionID={sessionID} key="backpacks-wrapper" />,
                        remoteControlSessionElement,
                    ]}
                />
                <Route
                    path={'/items/rigs'}
                    key="rigs-route"
                    element={[
                        <Rigs sessionID={sessionID} key="rigs-wrapper" />,
                        remoteControlSessionElement,
                    ]}
                />
                <Route
                    path={'/items/suppressors'}
                    key="suppressors-route"
                    element={[
                        <Suppressors sessionID={sessionID} key="suppressors-wrapper" />,
                        remoteControlSessionElement,
                    ]}
                />
                <Route
                    path={'/items/guns'}
                    key="guns-route"
                    element={[
                        <Guns sessionID={sessionID} key="guns-wrapper" />,
                        remoteControlSessionElement,
                    ]}
                />
                <Route
                    path={'/items/mods'}
                    key="mods-route"
                    element={[
                        <Mods sessionID={sessionID} key="mods-wrapper" />,
                        remoteControlSessionElement,
                    ]}
                />
                <Route
                    path={'/items/pistol-grips'}
                    key="pistol-grips-route"
                    element={[
                        <PistolGrips sessionID={sessionID} key="pistol-grips-wrapper" />,
                        remoteControlSessionElement,
                    ]}
                />
                <Route
                    path={'/items/barter-items'}
                    key="barter-items-route"
                    element={[
                        <BarterItems sessionID={sessionID} key="barter-items-wrapper" />,
                        remoteControlSessionElement,
                    ]}
                />
                <Route
                    path={'/items/containers'}
                    key="containers-route"
                    element={[
                        <Containers sessionID={sessionID} key="containers-wrapper" />,
                        remoteControlSessionElement,
                    ]}
                />
                <Route
                    path={'/items/food-and-drink'}
                    key="food-and-drink-route"
                    element={[
                        <Provisions sessionID={sessionID} key="provisions-wrapper" />,
                        remoteControlSessionElement,
                    ]}
                />
                <Route
                    path={'/items/grenades'}
                    key="grenades-route"
                    element={[
                        <Grenades sessionID={sessionID} key="grenades-wrapper" />,
                        remoteControlSessionElement,
                    ]}
                />
                <Route
                    path={'/items/headphones'}
                    key="headphones-route"
                    element={[
                        <Headsets sessionID={sessionID} key="headphones-wrapper" />,
                        remoteControlSessionElement,
                    ]}
                />
                <Route
                    path={'/items/headsets'}
                    key="headsets-route"
                    element={[
                        <Headsets sessionID={sessionID} key="headsets-wrapper" />,
                        remoteControlSessionElement,
                    ]}
                />
                <Route
                    path={'/items/keys'}
                    key="keys-route"
                    element={[
                        <Keys sessionID={sessionID} key="keys-wrapper" />,
                        remoteControlSessionElement,
                    ]}
                />
                <Route
                    path={'/items/provisions'}
                    key="provisions-route"
                    element={[
                        <Provisions sessionID={sessionID} key="provisions-wrapper" />,
                        remoteControlSessionElement,
                    ]}
                />
                <Route
                    path={'/bosses'}
                    key="bosses-route"
                    element={[
                        <Bosses sessionID={sessionID} key="bosses-wrapper" />,
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
                        <Boss sessionID={sessionID} key="specific-boss-wrapper" />,
                        remoteControlSessionElement,
                    ]}
                />
                <Route
                    path={'/traders'}
                    key="traders-route"
                    element={[
                        <Traders sessionID={sessionID} key="traders-wrapper" />,
                        remoteControlSessionElement,
                    ]}
                />
                <Route
                    path={'/traders/:traderName'}
                    key="traders-name-route"
                    element={[
                        <Trader sessionID={sessionID} key="trader-wrapper" />,
                        remoteControlSessionElement,
                    ]}
                />
                <Route
                    path={'/hideout-profit/'}
                    key="hideout-profit-route"
                    element={[
                        <Crafts key="hideout-profit-wrapper" />,
                        remoteControlSessionElement,
                    ]}
                />
                <Route
                    path={'/item-tracker/'}
                    key="item-tracker-route"
                    element={[
                        <ItemTracker key="item-tracker-wrapper" />,
                        remoteControlSessionElement,
                    ]}
                />
                <Route
                    path={'/item/:itemName'}
                    key="item-name-route"
                    element={[
                        <Item sessionID={sessionID} key="specific-item-wrapper" />,
                        remoteControlSessionElement,
                    ]}
                />
                <Route
                    path={'/debug/'}
                    key="debug-route"
                    element={[
                        <Debug key="debug-wrapper" />,
                        remoteControlSessionElement,
                    ]}
                />
                <Route
                    path={'/about'}
                    key="about-route"
                    element={[
                        <About key="about-wrapper" />,
                        remoteControlSessionElement,
                    ]}
                />
                <Route
                    path={'/api/'}
                    key="api-route"
                    element={[
                        <Suspense fallback={<Loading />} key="api-docs-wrapper">
                            <APIDocs />
                        </Suspense>,
                        remoteControlSessionElement,
                    ]}
                />
                <Route
                    path={'/nightbot/'}
                    key="nightbot-route"
                    element={[
                        <Nightbot />,
                        remoteControlSessionElement,
                    ]}
                />
                <Route
                    path={'/streamelements/'}
                    key="streamelements-route"
                    element={[
                        <StreamElements />,
                        remoteControlSessionElement,
                    ]}
                />
                <Route
                    path={'/moobot'}
                    key="moobot-route"
                    element={[
                        <Moobot />,
                        remoteControlSessionElement,
                    ]}
                />
                <Route
                    path={'/api-users/'}
                    key="api-users-route"
                    element={[
                        <Suspense fallback={<Loading />} key="api-users-wrapper">
                            <ApiUsers />
                        </Suspense>,
                        remoteControlSessionElement,
                    ]}
                />
                <Route
                    path={'/hideout'}
                    key="hideout-route"
                    element={[
                        <Hideout key="hideout-wrapper" />,
                        remoteControlSessionElement,
                    ]}
                />
                <Route
                    path={'/wipe-length'}
                    key="wipe-length-route"
                    element={[
                        <WipeLength key="wipe-length-wrapper" />,
                        remoteControlSessionElement,
                    ]}
                />
                <Route
                    path={'/bitcoin-farm-calculator'}
                    key="bitcoin-farm-calculator-route"
                    element={[
                        <BitcoinFarmCalculator key="bitcoin-farm-calculator" />,
                        remoteControlSessionElement,
                    ]}
                />
                <Route
                    path={'/settings/'}
                    key="settings-route"
                    element={[
                        <Settings key="settings-wrapper" />,
                        remoteControlSessionElement,
                    ]}
                />
                <Route 
                    path={'/control'} 
                    key="control-route"
                    element={[
                        <Control send={send} />
                    ]} 
                />
                <Route
                    path={'/guides/:guideKey'}
                    key="guides-name-route"
                    element={[
                        <Guides />
                    ]}
                />
                <Route
                    path="/items/:bsgCategoryName"
                    key="items-category-route"
                    element={[
                        <BsgCategory />,
                        remoteControlSessionElement,
                    ]}
                />
                <Route
                    path={'/tasks/'}
                    key="tasks-route"
                    element={[
                        <Quests key="quests-wrapper" />,
                        remoteControlSessionElement,
                    ]}
                />
                <Route
                    path={'/task/:taskIdentifier'}
                    key="task-route"
                    element={[
                        <Quest key="quest-wrapper" />,
                        remoteControlSessionElement,
                    ]}
                />
                <Route
                    path="*"
                    element={[<ErrorPage />, remoteControlSessionElement]}
                />
            </Routes>
            {/* </Suspense> */}
            <Footer />
        </div>
    );
}

export default App;
