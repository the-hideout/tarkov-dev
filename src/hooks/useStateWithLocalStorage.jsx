import { useEffect, useState } from 'react';

const useStateWithLocalStorage = (localStorageKey, fallbackValue) => {
    let initialValue = localStorage.getItem(localStorageKey);

    if (initialValue === null) {
        initialValue = fallbackValue;
    } else {
        initialValue = JSON.parse(initialValue);
    }

    const [value, setValue] = useState(initialValue);

    useEffect(() => {
        localStorage.setItem(localStorageKey, JSON.stringify(value));
    }, [value, localStorageKey]);

    return [value, setValue];
};

export default useStateWithLocalStorage;
