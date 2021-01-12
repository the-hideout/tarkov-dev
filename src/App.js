/* eslint-disable no-restricted-globals */
import { useState, useEffect, useCallback } from 'react';
import {
    Switch,
    Route,
    useHistory,
    Redirect
} from "react-router-dom";
import {Helmet} from "react-helmet";

import './App.css';
import Ammo from './components/Ammo.jsx';
import Map from './components/Map.jsx';
import ID from './components/ID.jsx';
import Control from './components/control';
import Menu from './components/menu';
import Barter from './components/Barter.jsx';
import Barters from './components/Barters';
import Glasses from './components/Glasses';
import About from './pages/about/';
import Maps from './pages/maps/';

import rawMapData from './data/maps.json';
import QuestItemsPage from './components/quest-items-page';
import useStateWithLocalStorage from './hooks/useStateWithLocalStorage';

const makeID = function makeID(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;

    for ( let i = 0; i < length; i = i + 1 ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
 };

 const socketServer = `wss://tarkov-socket-server.herokuapp.com`;

 let socket = false;

 function App() {
    const [sessionID, setSessionID] = useStateWithLocalStorage('sessionId', makeID(4));
    const [socketConnected, setSocketConnected] = useState(false);
    let history = useHistory();

    const setID = (newID) => {
        setSessionID(newID);
    };

    const handleDisplayMessage = (rawMessage) => {
        const message = JSON.parse(rawMessage.data);

        if(message.type !== 'command'){
            return false;
        }

        history.push(`/${message.data.type}/${message.data.value}`);
    };

    useEffect(() => {
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
                    setSocketConnected(false);
                }, 10000 + 1000);
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

                setSocketConnected(true);

                socket.send(JSON.stringify({
                    sessionID: sessionID,
                    type: 'connect',
                }));
            });

            socket.addEventListener('close', () => {
                console.log('Disconnected from socket server');

                setSocketConnected(false);

                clearTimeout(socket.pingTimeout);
            });

            setInterval(() => {
                if(socket.readyState === 3){
                    console.log('trying to re-connect');
                    connect();
                }
            }, 5000);
        };

        if(socket === false){
            connect();
        }

        return () => {
            // socket.terminate();
        };
    });

    const send = useCallback((messageData) => {
        if(socket.readyState !== 1){
            // Wait a bit if we're not connected
            setTimeout(() => {
                socket.send(JSON.stringify({
                    sessionID: sessionID,
                    ...messageData,
                }));
            }, 500);

            return true;
        }

        socket.send(JSON.stringify({
            sessionID: sessionID,
            ...messageData,
        }));
    }, [sessionID]);

    return <div
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
                path={["/ammo/:currentAmmo", "/ammo", '/tarkov-tools', ""]}
            >
                <Menu />
                <div
                    className="display-wrapper"
                >
                    <Helmet>
                        <meta charSet="utf-8" />
                        <title>Tarkov Ammo</title>
                        <meta
                            name="description"
                            content="Visualization of all ammo types in Escape from Tarkov"
                        />
                    </Helmet>
                    <Ammo />
                </div>
                <ID
                    sessionID = {sessionID}
                />
            </Route>
            <Route
                exact
                path={'/maps/'}
            >
                <Menu />
                <Maps />
                <ID
                    sessionID = {sessionID}
                />
            </Route>
            <Route
                path="/map/:currentMap"
            >
                <Menu />
                <div
                    className="display-wrapper"
                >
                    <Map />
                </div>
                <ID
                    sessionID = {sessionID}
                />
            </Route>
            <Route
                exact
                path={["/barter", "/loot-tier/:currentLoot", "/loot-tier"]}
            >
                <Menu />
                <div
                    className="display-wrapper"
                >
                    <Helmet>
                        <meta charSet="utf-8" />
                        <title>Tarkov loot tiers</title>
                        <meta
                            name="description"
                            content="Visualization of all different valuable loot"
                        />
                    </Helmet>
                    <Barter />
                </div>
                <ID
                    sessionID = {sessionID}
                />
            </Route>
            <Route
                exact
                path={'/barters/'}
            >
                <Menu />
                <Helmet>
                    <meta charSet="utf-8" />
                    <title>Tarkov barters</title>
                    <meta
                        name="description"
                        content="All available barters and their profitability"
                    />
                </Helmet>
                <Barters />
                <ID
                    sessionID = {sessionID}
                />
            </Route>
            <Route
                exact
                path={'/glasses/'}
            >
                <Menu />
                <Helmet>
                    <meta charSet="utf-8" />
                    <title>Tarkov eye protection</title>
                    <meta
                        name="description"
                        content="All available items for eye protection and their stats"
                    />
                </Helmet>
                <Glasses />
                <ID
                    sessionID = {sessionID}
                />
            </Route>
            <Route
                exact
                path={'/quest-items'}
            >
                <QuestItemsPage />
                <ID
                    sessionID = {sessionID}
                />
            </Route>
            <Route
                exact
                path={'/about/'}
            >
                <Menu />
                <About />
                <ID
                    sessionID = {sessionID}
                />
            </Route>
            <Route
                exact
                path={'/control'}
            >
                <Menu />
                <Control
                    send = {send}
                    setID = {setID}
                    sessionID = {sessionID}
                    socketConnected = {socketConnected}
                />
            </Route>
        </Switch>
    </div>
}

export default App;
