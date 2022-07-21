import { Bars } from 'react-loader-spinner';

import './index.css';

function Loading() {
    return (
        <div className="display-wrapper" key={'display-wrapper'}>
            <div className="loader-wrapper">
                <Bars
                    arialLabel="loading-indicator"
                    color="#9a8866"
                    height={100}
                    timeout={3000} //3 secs
                    width={100}
                />
            </div>
        </div>
    );
}

export default Loading;
