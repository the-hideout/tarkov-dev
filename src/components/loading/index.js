import Loader from 'react-loader-spinner';

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
                <Loader
                    type="Puff"
                    color="#9a8866"
                    height={100}
                    width={100}
                    timeout={3000} //3 secs
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


