/* eslint-disable no-restricted-globals */
import React, { useState, useEffect, useCallback } from 'react';
import {
    Switch,
    Route,
    useHistory,
  } from "react-router-dom";

import './App.css';
import Ammo from './components/Ammo.jsx';
import Map from './components/Map.jsx';
import ID from './components/ID.jsx';
import Control from './components/Control.jsx';
import Menu from './components/Menu.jsx';
import Barter from './components/Barter.jsx';

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
    const [sessionID, setSessionID] = useState(makeID(4));
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
                    socket.terminate();
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
        socket.send(JSON.stringify({
            sessionID: sessionID,
            ...messageData,
        }));
    }, [sessionID]);

    return <div className="App">
        <Menu />
        <div className="display-wrapper">
            <Switch>
                <Route
                    exact
                    path={["/ammo/:currentAmmo", "/ammo", '/tarkov-tools', ""]}
                >
                    <Ammo />
                </Route>
                <Route path="/map/:currentMap">
                    <Map />
                </Route>
                <Route
                    exact
                    path={["/barter", "/loot-tier/:currentLoot", "/loot-tier"]}
                >
                    <Barter />
                </Route>
            </Switch>
            <ID
                sessionID = {sessionID}
            />
        </div>
        <Control 
            send = {send}
            setID = {setID}
            sessionID = {sessionID}
            socketConnected = {socketConnected}
        />
    </div>
}

export default App;
