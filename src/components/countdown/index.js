import Countdown from 'react-countdown';

import './index.css';

const renderer = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) {
        // Render a completed state
        return null;
    } else {
        // Render a countdown
        return (
            <span className="countdown-wrapper">
                {days} days {hours} hours {minutes} minutes {seconds} seconds to
                wipe
            </span>
        );
    }
};

function WipeCountdown() {
    return <Countdown date={'2021-06-30T10:00:00+03:00'} renderer={renderer} />;
}

export default WipeCountdown;
