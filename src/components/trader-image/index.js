import { useMemo } from 'react';
import { Link } from "react-router-dom";

import './index.css';

export default function TraderImage({trader, image = 'icon', reputationChange, style = {}}) {
    const imageSize = useMemo(() => {
        const validSizes = {'icon': '-icon.jpg', 'portrait': '-portrait.png', 'poster': '.jpg'};
        if (image in validSizes) {
            return validSizes[image];
        }
        return '-icon';
    }, [image]);
    const formattedRep = useMemo(() => {
        if (!reputationChange) {
            return;
        }
        if (isNaN(reputationChange)) {
            return reputationChange;
        }
        if (reputationChange >= 0) {
            return `+${reputationChange}`;
        }
        return `${reputationChange}`;
    }, [reputationChange]);

    const repClass = useMemo(() => {
        if (isNaN(reputationChange) || !reputationChange) {
            return 'trader-image-reputation';
        }
        if (reputationChange < 0) {
            return 'trader-image-reputation negative-rep';
        };
        return 'trader-image-reputation positive-rep';
    }, [reputationChange]);

    const traderExtraStyle = {
        position: 'absolute',
        bottom: '1px',
        right: '1px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        maxWidth: '64px',
        maxHeight: '64px',
    };

    return <div style={{
        position: 'relative', 
        maxWidth: '64px',
        maxHeight: '64px',
        display: 'inline',
        ...style,
    }}>
        <Link to={`/trader/${trader.normalizedName}`}>
            <img alt={trader.name} src={`/images/traders/${trader.normalizedName}${imageSize}`} loading="lazy"/>
        </Link>
        <div style={traderExtraStyle}>
            {reputationChange && <span className={repClass}>{formattedRep}</span>}
        </div>
    </div>
}
