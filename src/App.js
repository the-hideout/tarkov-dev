/* eslint-disable no-restricted-globals */
import React, { useEffect, useCallback, Suspense } from 'react';
import {
    Routes,
    Route,
    useNavigate,
} from "react-router-dom";
import {Helmet} from "react-helmet";
import { useDispatch, useSelector } from 'react-redux';
import './App.css';
import './i18n';

import Map from './components/Map.jsx';
import ID from './components/ID.jsx';
import Menu from './components/menu';
import Footer from './components/footer';

import {setConnectionStatus, enableConnection} from './features/sockets/socketsSlice';

import Debug from './components/Debug';

// import rawMapData from './data/maps.json';
import useStateWithLocalStorage from './hooks/useStateWithLocalStorage';

import Ammo from './pages/ammo';
import Control from './pages/control';
import LootTiers from './pages/loot-tiers';
import Barters from './pages/barters';
import About from './pages/about/';
import Maps from './pages/maps/';
import ItemTracker from './pages/item-tracker/';
import Crafts from './pages/crafts';
import Item from './pages/item';
import Start from './pages/start';
import Settings from './pages/settings';
import makeID from './modules/make-id';
import Loading from './components/loading';
import Nightbot from './pages/nightbot';
import StreamElements from './pages/stream-elements';
import ApiUsers from './pages/api-users';

import Items from './pages/items/';
import Armor from './pages/items/armor';
import Backpacks from './pages/items/backpacks';
import BarterItems from './pages/items/barter-items';
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

import Prapor from './pages/traders/prapor';
import Therapist from './pages/traders/therapist';
import Skier from './pages/traders/skier';
import Peacekeeper from './pages/traders/peacekeeper';
import Mechanic from './pages/traders/mechanic';
import Ragman from './pages/traders/ragman';
import Jaeger from './pages/traders/jaeger';
import Traders from './pages/traders';

const APIDocs = React.lazy(() => import('./pages/api-docs'));
// import APIDocs from './pages/api-docs';


const socketServer = `wss://tarkov-tools-live.herokuapp.com`;

let socket = false;

function App() {
    const [sessionID] = useStateWithLocalStorage('sessionId', makeID(4));
    const socketEnabled = useSelector(state => state.sockets.enabled);
    const controlId = useSelector(state => state.sockets.controlId);
    let navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const handleDisplayMessage = (rawMessage) => {
            const message = JSON.parse(rawMessage.data);

            if(message.type !== 'command'){
                return false;
            }

            navigate(`/${message.data.type}/${message.data.value}`);
        };

        const connect = function connect(){
            socket = new WebSocket(socketServer);

            const heartbeat = function heartbeat() {
                clearTimeout(socket.pingTimeout);

                // Use `WebSocket#terminate()`, which immediately destroys the connection,
                // instead of `WebSocket#close()`, which waits for the close timer.
                // Delay should be equal to the interval at which your server
                // sends out pings plus a conservative assumption of the latency.
                socket.pingTimeout = setTimeout(() => {
                    if(socket && socket.terminate){
                        socket.terminate();
                    }
                    dispatch(setConnectionStatus(false));
                }, 40000 + 1000);
            };

            socket.addEventListener('message', (rawMessage) => {
                const message = JSON.parse(rawMessage.data);

                if(message.type === 'ping'){
                    heartbeat();

                    socket.send(JSON.stringify({type: 'pong'}));

                    return true;
                }

                handleDisplayMessage(rawMessage);
            });

            socket.addEventListener('open', () => {
                console.log('Connected to socket server');
                console.log(socket);

                heartbeat();

                dispatch(setConnectionStatus(true));

                socket.send(JSON.stringify({
                    sessionID: sessionID,
                    type: 'connect',
                }));
            });

            socket.addEventListener('close', () => {
                console.log('Disconnected from socket server');

                dispatch(setConnectionStatus(false));

                clearTimeout(socket.pingTimeout);
            });

            setInterval(() => {
                if(socket.readyState === 3 && socketEnabled){
                    console.log('trying to re-connect');
                    connect();
                }
            }, 5000);
        };

        if(socket === false && socketEnabled){
            connect();
        }

        return () => {
            // socket.terminate();
        };
    }, [socketEnabled, sessionID, navigate, dispatch]);

    const send = useCallback((messageData) => {
        if(socket.readyState !== 1){
            // Wait a bit if we're not connected
            setTimeout(() => {
                socket.send(JSON.stringify({
                    sessionID: controlId,
                    ...messageData,
                }));
            }, 500);

            return true;
        }

        socket.send(JSON.stringify({
            sessionID: controlId,
            ...messageData,
        }));
    }, [controlId]);

return (
    <div
        className = 'App'
    >
    <Helmet>
        <meta charSet="utf-8" />
        <title>Tarkov Tools</title>
        <meta
            name="description"
            content="Visualization of all ammo types in Escape from Tarkov, along with maps and other great tools"
        />
    </Helmet>
    <Menu />
    {/* <Suspense fallback={<Loading />}> */}
        <Routes>
            <Route
                path={'/'}
                element = {[
                    <Start
                        key = 'start-wrapper'
                    />,
                    <ID
                        key = 'connection-wrapper'
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />]
                }
            />
            <Route
                path={'/tarkov-tools'}
                element = {[
                    <Start
                        key = 'start-wrapper'
                    />,
                    <ID
                        key = 'connection-wrapper'
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />]
                }
            />
            <Route
                path={"/ammo"}
                element = {[
                    <div
                        className="display-wrapper"
                        key = 'ammo-wrapper'
                    >
                        <Helmet>
                            <meta charSet="utf-8" />
                            <title>Tarkov Ammo Chart</title>
                            <meta
                                name="description"
                                content="Visualization of all ammo types in Escape from Tarkov"
                            />
                        </Helmet>
                        <Ammo />
                    </div>,
                    <ID
                        key = 'connection-wrapper'
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                ]}
            />
            <Route
                path={"/ammo/:currentAmmo"}
                element = {[
                    <div
                        className="display-wrapper"
                        key = 'ammo-wrapper'
                    >
                        <Helmet>
                            <meta charSet="utf-8" />
                            <title>Tarkov Ammo Chart</title>
                            <meta
                                name="description"
                                content="Visualization of all ammo types in Escape from Tarkov"
                            />
                        </Helmet>
                        <Ammo />
                    </div>,
                    <ID
                        key = 'connection-wrapper'
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                ]}
            />
            <Route
                path={'/maps/'}
                element = {[
                    <Maps
                        key = 'maps-wrapper'
                    />,
                    <ID
                        key = 'connection-wrapper'
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                ]}
            />
            <Route
                path="/map/:currentMap"
                element = {[
                    <div
                        className="display-wrapper"
                        key = 'map-wrapper'
                    >
                        <Map />
                    </div>,
                    <ID
                        key = 'connection-wrapper'
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                ]}
            />
            <Route
                path={"/barter"}
                element = {[
                    <LootTiers
                        sessionID = {sessionID}
                        key = 'loot-tier-wrapper'
                    />,
                    <ID
                        key = 'connection-wrapper'
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                ]}
            />
            <Route
                path={"/loot-tier/:currentLoot"}
                element = {[
                    <LootTiers
                        sessionID = {sessionID}
                        key = 'loot-tier-wrapper'
                    />,
                    <ID
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                ]}
            />
            <Route
                path={"/loot-tier"}
                element = {[
                    <LootTiers
                        sessionID = {sessionID}
                        key = 'loot-tier-wrapper'
                    />,
                    <ID
                        key = 'connection-wrapper'
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                ]}
            />
            <Route
                path={'/barters/'}
                element = {[
                    <Barters
                        key = 'barters-wrapper'
                    />,
                    <ID
                        key = 'connection-wrapper'
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                ]}
            />
            <Route
                path={'/items/'}
                element = {[
                    <Items
                        key = 'items-wrapper'
                    />,
                    <ID
                        key = 'connection-wrapper'
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                ]}
            />
            <Route
                path="/items/helmets"
                element = {[
                    <Helmets
                        sessionID = {sessionID}
                        key = 'helmets-wrapper'
                    />,
                    <ID
                        key = 'connection-wrapper'
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                ]}
            />

            <Route
                path="/items/glasses"
                element = {[
                    <Glasses
                        sessionID = {sessionID}
                        key = 'glasses-wrapper'
                    />,
                    <ID
                        key = 'connection-wrapper'
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                ]}
            />
            <Route
                path={'/items/armor'}
                element = {[
                    <Armor
                        sessionID = {sessionID}
                        key = 'armor-wrapper'
                    />,
                    <ID
                        key = 'connection-wrapper'
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                ]}
            />
            <Route
                path={'/items/backpacks'}
                element = {[
                    <Backpacks
                        sessionID = {sessionID}
                        key = 'backpacks-wrapper'
                    />,
                    <ID
                        key = 'connection-wrapper'
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                ]}
            />
            <Route
                path={'/items/rigs'}
                element = {[
                    <Rigs
                        sessionID = {sessionID}
                        key = 'rigs-wrapper'
                    />,
                    <ID
                        key = 'connection-wrapper'
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                ]}
            />
            <Route
                path={'/items/suppressors'}
                element = {[
                    <Suppressors
                        sessionID = {sessionID}
                        key = 'suppressors-wrapper'
                    />,
                    <ID
                        key = 'connection-wrapper'
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                ]}
            />
            <Route
                path={'/items/guns'}
                element = {[
                    <Guns
                        sessionID = {sessionID}
                        key = 'guns-wrapper'
                    />,
                    <ID
                        key = 'connection-wrapper'
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                ]}
            />
            <Route
                path={'/items/mods'}
                element = {[
                    <Mods
                        sessionID = {sessionID}
                        key = 'mods-wrapper'
                    />,
                    <ID
                        key = 'connection-wrapper'
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                ]}
            />
            <Route
                path={'/items/pistol-grips'}
                element = {[
                    <PistolGrips
                        sessionID = {sessionID}
                        key = 'pistol-grips-wrapper'
                    />,
                    <ID
                        key = 'connection-wrapper'
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                ]}
            />
            <Route
                path={'/items/barter-items'}
                element = {[
                    <BarterItems
                        sessionID = {sessionID}
                        key = 'barter-items-wrapper'
                    />,
                    <ID
                        key = 'connection-wrapper'
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                ]}
            />
            <Route
                path={'/items/grenades'}
                element = {[
                    <Grenades
                        sessionID = {sessionID}
                        key = 'grenades-wrapper'
                    />,
                    <ID
                        key = 'connection-wrapper'
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                ]}
            />
            <Route
                path={'/items/headsets'}
                element = {[
                    <Headsets
                        sessionID = {sessionID}
                        key = 'headsets-wrapper'
                    />,
                    <ID
                        key = 'connection-wrapper'
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                ]}
            />
            <Route
                path={'/items/keys'}
                element = {[
                    <Keys
                        sessionID = {sessionID}
                        key = 'keys-wrapper'
                    />,
                    <ID
                        key = 'connection-wrapper'
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                ]}
            />
            <Route
                path={'/items/provisions'}
                element = {[
                    <Provisions
                        sessionID = {sessionID}
                        key = 'provisions-wrapper'
                    />,
                    <ID
                        key = 'connection-wrapper'
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                ]}
            />
            <Route
                path={'/traders'}
                element = {[
                    <Traders
                        sessionID = {sessionID}
                        key = 'traders-wrapper'
                    />,
                    <ID
                        key = 'connection-wrapper'
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                ]}
            />
            <Route
                path={'/traders/prapor'}
                element = {[
                    <Prapor
                        sessionID = {sessionID}
                        key = 'prapor-wrapper'
                    />,
                    <ID
                        key = 'connection-wrapper'
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                ]}
            />
            <Route
                path={'/traders/therapist'}
                element = {[
                    <Therapist
                        sessionID = {sessionID}
                        key = 'therapist-wrapper'
                    />,
                    <ID
                        key = 'connection-wrapper'
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                ]}
            />
            <Route
                path={'/traders/skier'}
                element = {[
                    <Skier
                        sessionID = {sessionID}
                        key = 'skier-wrapper'
                    />,
                    <ID
                        key = 'connection-wrapper'
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                ]}
            />
            <Route
                path={'/traders/peacekeeper'}
                element = {[
                    <Peacekeeper
                        sessionID = {sessionID}
                        key = 'peacekeeper-wrapper'
                    />,
                    <ID
                        key = 'connection-wrapper'
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                ]}
            />
            <Route
                path={'/traders/mechanic'}
                element = {[
                    <Mechanic
                        sessionID = {sessionID}
                        key = 'mechanic-wrapper'
                    />,
                    <ID
                        key = 'connection-wrapper'
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                ]}
            />
            <Route
                path={'/traders/ragman'}
                element = {[
                    <Ragman
                        sessionID = {sessionID}
                        key = 'ragman-wrapper'
                    />,
                    <ID
                        key = 'connection-wrapper'
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                ]}
            />
            <Route
                path={'/traders/jaeger'}
                element = {[
                    <Jaeger
                        sessionID = {sessionID}
                        key = 'jaeger-wrapper'
                    />,
                    <ID
                        key = 'connection-wrapper'
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                ]}
            />
            <Route
                path={'/hideout-profit/'}
                element = {[
                    <Crafts
                        key = 'hideout-profit-wrapper'
                    />,
                    <ID
                        key = 'connection-wrapper'
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                ]}
            />
            <Route
                path={'/item-tracker/'}
                element = {[
                    <ItemTracker
                        key = 'item-tracker-wrapper'
                    />,
                    <ID
                        key = 'connection-wrapper'
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                ]}
            />
            <Route
                path={'/item/:itemName'}
                element = {[
                    <Item
                        sessionID = {sessionID}
                        key = 'specific-item-wrapper'
                    />,
                    <ID
                        key = 'connection-wrapper'
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                ]}
            />
            <Route
                path={'/debug/'}
                element = {[
                    <Debug
                        key = 'debug-wrapper'
                    />,
                    <ID
                        key = 'connection-wrapper'
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                ]}
            />
            <Route
                path={'/about/'}
                element = {[
                    <About
                        key = 'about-wrapper'
                    />,
                    <ID
                        key = 'connection-wrapper'
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                ]}
            />
            <Route
                path={'/api/'}
                element = {[
                    <Suspense
                        fallback={<Loading />}
                        key = 'api-docs-wrapper'
                    >
                        <APIDocs />
                    </Suspense>,
                    <ID
                        key = 'connection-wrapper'
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                ]}
            />
            <Route
                path={'/nightbot/'}
                element = {[
                    <Suspense
                        fallback={<Loading />}
                        key = 'nightbot-docs-wrapper'
                    >
                        <Nightbot />
                    </Suspense>,
                    <ID
                        key = 'connection-wrapper'
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                ]}
            />
            <Route
                path={'/streamelements/'}
                element = {[
                    <Suspense
                        fallback={<Loading />}
                        key = 'streamelements-docs-wrapper'
                    >
                        <StreamElements />
                    </Suspense>,
                    <ID
                        key = 'connection-wrapper'
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                ]}
            />
            <Route
                path={'/api-users/'}
                element = {[
                    <Suspense
                        fallback={<Loading />}
                        key = 'api-users-wrapper'
                    >
                        <ApiUsers />
                    </Suspense>,
                    <ID
                        key = 'connection-wrapper'
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                ]}
            />
            <Route
                path={'/settings/'}
                element = {[
                    <Settings
                        key = 'settings-wrapper'
                    />,
                    <ID
                        key = 'connection-wrapper'
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                ]}
            />
            <Route
                path={'/control'}
                element = {[
                    <Control
                        send = {send}
                    />
                ]}
            />
        </Routes>
    {/* </Suspense> */}
    <Footer />
    </div>);
}

export default App;
