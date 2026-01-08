import { useEffect } from "react";

export let windowHasFocus = false;

// User has switched back to the tab
const onFocus = () => {
    windowHasFocus = true;
};

// User has switched away from the tab (AKA tab is hidden)
const onBlur = () => {
    windowHasFocus = false;
};

const WindowFocusHandler = () => {
    useEffect(() => {
        window.addEventListener("focus", onFocus);
        window.addEventListener("blur", onBlur);
        // Calls onFocus when the window first loads
        onFocus();
        // Specify how to clean up after this effect:
        return () => {
            window.removeEventListener("focus", onFocus);
            window.removeEventListener("blur", onBlur);
        };
    }, []);

    return <></>;
};

export default WindowFocusHandler;
