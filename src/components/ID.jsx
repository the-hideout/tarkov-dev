import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const Sides = {
    Left: 'Left',
    Right: 'Right',
};

function ID(props) {
    const [side, setSide] = useState(Sides.Left);
    const {t} = useTranslation();

    let sideClass;
    let sideButtonContent;
    let otherSide;
    if (side === Sides.Left) {
        sideClass = 'id-wrapper-left';
        sideButtonContent = '>>';
        otherSide = Sides.Right;
    } else {
        sideClass = 'id-wrapper-right';
        sideButtonContent = '<<';
        otherSide = Sides.Left;
    }

    const handleSwitchSideClick = useCallback(() => {
        setSide(otherSide)
    }, [setSide, otherSide]);

    return <div
        className={`id-wrapper ${ sideClass }`}
        alt={t('open this page in another browser or window and connect using this id')}
        title={t('open this page in another browser or window and connect using this id')}
    >
        <div className="update-label">
            {t('ID for remote control')}
            <span
                className="session-question"
            >
                ?
                <div
                    className="session-popup"
                >
                    {t('Go to tarkov tools with another browser and enter this ID to control this page from there')}
                </div>
            </span>
            <button
                className="session-switch-side"
                onClick={handleSwitchSideClick}
            >
                { sideButtonContent }
            </button>
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


