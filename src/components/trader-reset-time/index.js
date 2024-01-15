import Countdown from 'react-countdown';
import { Translation } from 'react-i18next';

import { getRelativeTimeAndUnit } from '../../modules/format-duration.js';

import './index.css';

const Renderer = (props) => {
    if (props.completed) {
        let dateParsed = Date.parse(props.props.date);
        let relativeTime = getRelativeTimeAndUnit(dateParsed);
        
        return (
            <Translation>
                {(t, { i18n }) => <span>{t('{{val, relativetime}}', { val: relativeTime[0], range: relativeTime[1] })}</span>}
            </Translation>
        );
    }

    return (
        <span>
            <Translation>
                {(t, { i18n }) => <span className="countdown-text-wrapper">{t('Restock in')}</span>}
            </Translation>
            {' '}
            <span>
                {props.formatted.hours}:{props.formatted.minutes}:{props.formatted.seconds}
            </span>
        </span>
    );
};

function TraderResetTime({ timestamp, center = false, locale = 'en' }) {
    return (
        <div className={`countdown-wrapper ${center ? 'center' : ''}`}>
            <Countdown
                date={timestamp}
                renderer={Renderer}
                locale={locale}
            />
        </div>
    );
}

export default TraderResetTime;
