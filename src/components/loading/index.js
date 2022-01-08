import {Bars} from 'react-loader-spinner';

import ID from '../ID.jsx';

import './index.css';

function Loading(props) {
    return [
        <div
            className="display-wrapper"
            key = {'display-wrapper'}
        >
            <div
                className = 'loader-wrapper'
            >
                <Bars
                    arialLabel="loading-indicator"
                    color="#9a8866"
                    height={100}
                    timeout={3000} //3 secs
                    width={100}
                />
            </div>
        </div>,
        <ID
            key = {'session-id'}
            sessionID = {props.sessionID}
        />
    ];
};

export default Loading;


