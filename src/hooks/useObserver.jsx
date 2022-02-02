import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import ResizeObserver from 'resize-observer-polyfill';

const useObserver = ({ callback, element }) => {
    const current = element && element.current;
    const observer = useRef(null);

    useEffect(() => {
        const observe = () => {
            if (element && element.current && observer.current) {
                observer.current.observe(element.current);
            }
        };

        const defaultElement = element.current;

        if (observer && observer.current && current) {
            observer.current.unobserve(current);
        }

        const resizeObserverOrPolyfill = ResizeObserver;
        observer.current = new resizeObserverOrPolyfill(callback);
        observe();

        return () => {
            if (observer && observer.current && element && defaultElement) {
                observer.current.unobserve(defaultElement);
            }
        };
    }, [current, callback, element]);
};

useObserver.propTypes = {
    element: PropTypes.object,
    callback: PropTypes.func,
};

export default useObserver;
