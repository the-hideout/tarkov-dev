/* eslint-disable no-restricted-globals */
import { useState, useRef } from 'react';
import {
    useHistory
} from 'react-router-dom';

 function Connect(props) {
    const [connectionText, setConnectionText] = useState('Connect');
    const [connectID, setConnectID] = useState(props.sessionID);
    let history = useHistory();
    const inputRef = useRef(null);

    const handleIDChange = (event) => {
        const tempConnectID = event.target.value.trim().toUpperCase().substring(0, 4);
        props.setID(tempConnectID);

        setConnectID(tempConnectID);
    };

    const handleConnectClick = (event) => {
        if(connectID.length !== 4){
            inputRef.current.focus();

            return true;
        }

        setConnectionText(`Connected to ${props.sessionID}`);

        props.handleControlling(true);

        history.push(`/control/`);
    };

    return <div
        className="connection-wrapper"
    >
        <input
            maxLength = "4"
            minLength = "4"
            name = "session-id"
            onChange = {handleIDChange}
            placeholder = "desktop id"
            ref = {inputRef}
            type = "text"
        />
        <input
            disabled = {!props.socketConnected}
            onClick = {handleConnectClick}
            type = "submit"
            value = {connectionText}
        />
    </div>;
}

export default Connect;
