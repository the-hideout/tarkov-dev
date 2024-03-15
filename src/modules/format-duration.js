import duration from 'dayjs/plugin/duration.js';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';

dayjs.extend(relativeTime);
dayjs.extend(duration);

export function getDurationDisplay(time) {
    let format = '';

    if (dayjs.duration(time).seconds() > 0) {
        format = `s[s] ${format}`;
    }

    if (dayjs.duration(time).minutes() > 0) {
        format = `mm[m] ${format}`;
    }

    if (dayjs.duration(time).hours() > 0) {
        format = `H[h] ${format}`;
    }

    if (dayjs.duration(time).days() > 0) {
        format = `D[d] ${format}`;
    }

    return dayjs.duration(time).format(format);
}

export function getFinishDisplay(time) {
    return dayjs().add(time, 'milliseconds').format('ddd hh:mm:ssA');
}

// in miliseconds
var units = {
    year  : 24 * 60 * 60 * 1000 * 365,
    month : 24 * 60 * 60 * 1000 * 365/12,
    day   : 24 * 60 * 60 * 1000,
    hour  : 60 * 60 * 1000,
    minute: 60 * 1000,
    second: 1000
}

export function getRelativeTimeAndUnit(d1, d2 = new Date()) {
    var elapsed = d1 - d2
    
    // "Math.abs" accounts for both "past" & "future" scenarios
    for (var u in units) 
        if (Math.abs(elapsed) > units[u] || u === 'second') 
            return [ Math.round(elapsed/units[u]), u ];
}