/* eslint-disable no-restricted-globals */
import React, { useEffect, useCallback, Suspense } from 'react';
import {
    Switch,
    Route,
    useHistory,
    Redirect,
    BrowserRouter as Router,
} from "react-router-dom";
import {Helmet} from "react-helmet";
import { useDispatch, useSelector } from 'react-redux';
import './App.css';
import './i18n';

import Map from './components/Map.jsx';
import ID from './components/ID.jsx';
import Menu from './components/menu';
import Footer from './components/footer';
import Loading from './components/loading';

import {setConnectionStatus, enableConnection} from './features/sockets/socketsSlice';

import Debug from './components/Debug';

import rawMapData from './data/maps.json';
import useStateWithLocalStorage from './hooks/useStateWithLocalStorage';

const Ammo = React.lazy(() => import ('./pages/Ammo.jsx'));
const Control = React.lazy(() => import('./pages/control'));
const LootTier = React.lazy(() => import('./pages/LootTier.jsx'));
const Barters = React.lazy(() => import('./pages/barters'));
const About = React.lazy(() => import('./pages/about/'));
const Maps = React.lazy(() => import('./pages/maps/'));
const ItemTracker = React.lazy(() => import('./pages/ItemTracker'));
const Guides = React.lazy(() => import('./pages/guides/'));
const Glasses = React.lazy(() => import('./pages/guides/Glasses'));
const Armor = React.lazy(() => import('./pages/guides/Armor'));
const Helmets = React.lazy(() => import('./pages/guides/Helmets'));
const Backpacks = React.lazy(() => import('./pages/guides/Backpacks'));
const Crafts = React.lazy(() => import('./pages/crafts'));
const Item = React.lazy(() => import('./pages/item'));
const Start = React.lazy(() => import('./pages/start'));
const APIDocs = React.lazy(() => import('./pages/api-docs'));

const makeID = function makeID(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;

    for ( let i = 0; i < length; i = i + 1 ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
 };

const socketServer = `wss://tarkov-tools-live.herokuapp.com`;

let socket = false;

function App() {
    const [sessionID] = useStateWithLocalStorage('sessionId', makeID(4));
    const socketEnabled = useSelector(state => state.sockets.enabled);
    const controlId = useSelector(state => state.sockets.controlId);
    let history = useHistory();
    const dispatch = useDispatch();

    useEffect(() => {
        const handleDisplayMessage = (rawMessage) => {
            const message = JSON.parse(rawMessage.data);

            if(message.type !== 'command'){
                return false;
            }

            history.push(`/${message.data.type}/${message.data.value}`);
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

        return () => {
            // socket.terminate();
        };
    }, [socketEnabled, sessionID, history, dispatch]);

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
    <Router>
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
        <Suspense fallback={<Loading />}>
            <Switch>
                <Route
                    exact
                    strict
                    sensitive
                    path={rawMapData.map((mapData) => {
                        return `/map/${mapData.key.toUpperCase()}`;
                    })}
                    render = { props => {
                        const path = props.location.pathname;
                        return <Redirect to={`${path.toLowerCase()}`} />
                    }}
                />
                <Route
                    exact
                    path={['/tarkov-tools', ""]}
                >
                    <Start />
                    <ID
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                </Route>
                <Route
                    exact
                    path={["/ammo/:currentAmmo", "/ammo",]}
                >
                    <div
                        className="display-wrapper"
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
                    </div>
                    <ID
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                </Route>
                <Route
                    exact
                    path={'/maps/'}
                >
                    <Maps />
                    <ID
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                </Route>
                <Route
                    path="/map/:currentMap"
                >
                    <div
                        className="display-wrapper"
                    >
                        <Map />
                    </div>
                    <ID
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                </Route>
                <Route
                    exact
                    path={["/barter", "/loot-tier/:currentLoot", "/loot-tier"]}
                >
                    <LootTier
                        sessionID = {sessionID}
                    />
                    <ID
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                </Route>
                <Route
                    exact
                    path={'/barters/'}
                >
                    <Barters />
                    <ID
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                </Route>
                <Route
                    exact
                    path={'/gear/'}
                >
                    <Guides />
                    <ID
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                </Route>
                <Route
                    path="/gear/helmets"
                >
                    <Helmets
                        sessionID = {sessionID}
                    />
                    <ID
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                </Route>
                <Route
                    path="/gear/glasses"
                >
                    <Glasses
                        sessionID = {sessionID}
                    />
                    <ID
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                </Route>
                <Route
                    exact
                    path={'/gear/armor'}
                >
                    <Armor
                        sessionID = {sessionID}
                    />
                    <ID
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                </Route>
                <Route
                    exact
                    path={'/gear/backpacks'}
                >
                    <Backpacks
                        sessionID = {sessionID}
                    />
                    <ID
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                </Route>
                <Route
                    exact
                    path={'/hideout-profit/'}
                >
                    <Crafts />
                    <ID
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                </Route>
                <Route
                    exact
                    path={'/item-tracker/'}
                >
                    <ItemTracker />
                    <ID
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                </Route>
                <Route
                    exact
                    path={'/item/:itemName'}
                >
                    <Item
                        sessionID = {sessionID}
                    />
                    <ID
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                </Route>
                <Route
                    exact
                    path={'/debug/'}
                >
                    <Debug />
                    <ID
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                </Route>
                <Route
                    exact
                    path={'/about/'}
                >
                    <About />
                    <ID
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                </Route>
                <Route
                    exact
                    path={'/api/'}
                >
                    <APIDocs />
                    <ID
                        sessionID = {sessionID}
                        socketEnabled = {socketEnabled}
                        onClick = {e => dispatch(enableConnection())}
                    />
                </Route>
                <Route
                    exact
                    path={'/control'}
                >
                    <Control
                        send = {send}
                    />
                </Route>
            </Switch>
        </Suspense>
        <Footer />
        </div>
    </Router>);
}

export default App;
