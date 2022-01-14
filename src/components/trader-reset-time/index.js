import { useQuery } from 'react-query';
import Countdown from 'react-countdown';
// import { useTranslation } from 'react-i18next';

const Renderer = (props) => {
    // const t = useTranslation();
    if (props.completed) {
        return <span
            className = 'countdown-wrapper'
        >
            Restock right now
        </span>;
    }

    return <span
        className = 'countdown-wrapper'
    >
        Restock in {props.formatted.hours}:{props.formatted.minutes}:{props.formatted.seconds}
    </span>;
};

function TraderResetTime({trader}) {
    const { status, data } = useQuery(`server-status`, () =>
        fetch('https://tarkov-tools.com/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: dataQuery,
            })
            .then(response => response.json() )
    );

    const dataQuery = JSON.stringify({query: `{
        traderResetTimes {
            name
            resetTimestamp
        }
    }`});

    if(status !== 'success' || !data.data.traderResetTimes){
        return null;
    }

    if(status === 'success' && data.data.traderResetTimes.length === 0){
        return 'No data';
    }

    return <div>
        <Countdown
            date={data.data.traderResetTimes.find(resetTime => resetTime.name === trader).resetTimestamp}
            renderer={Renderer}
        />
    </div>
}

export default TraderResetTime;