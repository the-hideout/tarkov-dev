import duration from 'dayjs/plugin/duration';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)
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
    return dayjs().add(time, 'milliseconds').format("ddd hh:mm:ssA")
}