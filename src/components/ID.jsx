import React from 'react';

function ID(props) {        
    return <div
        className="id-wrapper" 
        alt="open this page on your phone and connect using this id"
        title="open this page on your phone and connect using this id"
    >
        <div className="update-label">
            Code for phone control       
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35 35">
            <path d="M25 0H10C8 0 7 1 7 2v31c0 1 1 2 3 2h15c2 0 3-1 3-2V2c0-1-1-2-3-2zM15 2h5-5zm3 32a1 1 0 11-1-3 1 1 0 011 3zm8-3H9V4h17v27z"/>
        </svg>
        <span className="session-id">
            {props.sessionID}
        </span>
    </div>;
}

export default ID;


