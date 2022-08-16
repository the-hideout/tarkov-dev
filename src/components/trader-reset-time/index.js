//import { useQuery } from 'react-query';
import Countdown from 'react-countdown';
// import { useTranslation } from 'react-i18next';

import './index.css';

const Renderer = (props) => {
    // const t = useTranslation();
    if (props.completed) {
        return <span>Restock right now</span>;
    }

    return (
        <span>
            <span className="countdown-text-wrapper">Restock in</span>{' '}
            <span>
                {props.formatted.hours}:{props.formatted.minutes}:
            </span>
            {props.formatted.seconds}
        </span>
    );
};

function TraderResetTime({ timestamp, center = false }) {
    /*const dataQuery = JSON.stringify({
        query: `{
        traderResetTimes {
            name
            resetTimestamp
        }
    }`,
    });

    const { status, data } = useQuery(
        `traderTimer`,
        () =>
            fetch('https://api.tarkov.dev/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: dataQuery,
            }).then((response) => response.json()),
        {
            refetchOnMount: false,
            refetchOnWindowFocus: false,
        },
    );

    if (status !== 'success' || !data.data.traderResetTimes) {
        return null;
    }

    if (status === 'success' && data.data.traderResetTimes.length === 0) {
        return 'No data';
    }*/

    return (
        <div className={`countdown-wrapper ${center ? 'center' : ''}`}>
            <Countdown
                date={timestamp}
                renderer={Renderer}
            />
        </div>
    );
}

export default TraderResetTime;
