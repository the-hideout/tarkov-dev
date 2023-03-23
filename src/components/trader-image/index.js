import { useMemo } from 'react';
import { Link } from "react-router-dom";

import './index.css';

export default function TraderImage({trader, image = 'icon', reputationChange}) {
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
    }}>
        <Link to={`/trader/${trader.normalizedName}`}>
            <img alt={trader.name} src={`/images/traders/${trader.normalizedName}-${image}.jpg`}/>
        </Link>
        <div style={traderExtraStyle}>
            {reputationChange && <span className="trader-image-reputation">{formattedRep}</span>}
        </div>
    </div>
}
