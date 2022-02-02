import { useEffect, useState } from 'react';

function useDate(initial, updateSpeed) {
    const [time, setTime] = useState(initial);
    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
        }, updateSpeed);
        return () => clearInterval(interval);
    }, [updateSpeed]);

    return time;
}

export default useDate;
