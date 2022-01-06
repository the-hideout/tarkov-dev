import dayjs from 'dayjs';
import dayjsUtc from 'dayjs/plugin/utc'

import useDate from '../hooks/useDate';

/*
Huge thanks to Adam Burgess
https://github.com/adamburgess/tarkov-time
as most of the code is his.

Thanks a bunch!
*/

dayjs.extend(dayjsUtc);

// 1 second real time = 7 seconds tarkov time
const tarkovRatio = 7;

export function hrs(num) {
    return 1000 * 60 * 60 * num;
}

export function realTimeToTarkovTime(time, left) {
    // tarkov time moves at 7 seconds per second.
    // surprisingly, 00:00:00 does not equal unix 0... but it equals unix 10,800,000.
    // Which is 3 hours. What's also +3? Yep, Russia. UTC+3.
    // therefore, to convert real time to tarkov time,
    // tarkov time = (real time * 7 % 24 hr) + 3 hour

    const oneDay = hrs(24);
    const russia = hrs(3);

    const offset = russia + (left ? 0 : hrs(12));
    const tarkovTime = new Date((offset + (time.getTime() * tarkovRatio)) % oneDay);

    return tarkovTime;
};

export function timeUntilRelative(until, left, date) {
    const tarkovTime = realTimeToTarkovTime(date, left);

    if (until < tarkovTime.getTime()) {
        until += hrs(24);
    }

    const diffTarkov = until - tarkovTime.getTime();
    const diffRT = diffTarkov / tarkovRatio;

    return diffRT;
};

export function formatFuture(ms) {
    const time = dayjs.utc(ms);
    const hour = time.hour();
    const min = time.minute();
    const sec = time.second();
    let text = '';

    if (hour !== 0) {
        text = hour + 'hr';
    }

    text += min + 'min';

    if(hour === 0 && min === 0) {
        text = sec + 's';
    }

    return text;
};

const getSource = (props) => {
    const overlayItem = [
        <div
            key = {`${props.currentMap}-duration`}
        >
            Duration: {props.duration}
        </div>,
        <div
            key = {`${props.currentMap}-players`}
        >
            Players: {props.players}
        </div>,
    ];

    if(props.source){
        overlayItem.push(<div
            key = {`${props.currentMap}-attribution`}
        >
            By: <a href={props.sourceLink}>{props.source}</a>
        </div>);
    }

    return overlayItem;
};

function Time(props) {
    const time = useDate(new Date(), 50);

    if(props?.currentMap === 'factory'){
        return <div
            className = 'time-wrapper'
        >
            <div>
                15:28:00
            </div>
            <div>
                03:28:00
            </div>
            {getSource(props)}
        </div>;
    }

    if(props?.currentMap === 'labs'){
        const source = getSource(props);

        if(!source){
            return null;
        }

        return <div
            className = 'time-wrapper'
        >
            {getSource(props)}
        </div>;
    }

    const tarkovTime1 = realTimeToTarkovTime(time, true);
    const tarkovTime2 = realTimeToTarkovTime(time);

    return <div
        className = 'time-wrapper'
    >
        <div>
            {dayjs.utc(tarkovTime1).format('HH:mm:ss')}
        </div>
        <div>
            {dayjs.utc(tarkovTime2).format('HH:mm:ss')}
        </div>
        {getSource(props)}
    </div>;
}

export default Time;
