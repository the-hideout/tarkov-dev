import { ScaleLoader } from 'react-spinners';

import './index.css';

function Loading() {
    return (
        <div className="display-wrapper" key={'display-wrapper'}>
            <div className="loader-wrapper">
                <ScaleLoader
                    color={'#9a8866'}
                    height={100}
                    width={8}
                    margin={4}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                />
            </div>
        </div>
    );
}

export default Loading;
