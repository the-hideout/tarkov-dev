import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import './index.css';

const Sides = {
    Left: 'Left',
    Right: 'Right',
};

function ID(props) {
    const [side, setSide] = useState(Sides.Left);
    const { t } = useTranslation();

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
        setSide(otherSide);
    }, [setSide, otherSide]);

    return (
        <div
            className={`id-wrapper ${sideClass}`}
            alt={t(
                'open this page in another browser or window and connect using this id',
            )}
            title={t(
                'open this page in another browser or window and connect using this id',
            )}
            onClick={props.onClick}
        >
            <div className="update-label">
                {t('ID for remote control')}
                <span className="session-question">
                    <span>?</span>
                    <div className="session-popup">
                        {t(
                            'Go to Tarkov.dev with another browser and enter this ID to control this page from there',
                        )}
                    </div>
                </span>
                <button
                    className="session-switch-side"
                    onClick={handleSwitchSideClick}
                >
                    {sideButtonContent}
                </button>
            </div>
            <span className="session-id">
                {props.socketEnabled ? props.sessionID : t('Click to connect')}
            </span>
        </div>
    );
}

export default ID;
