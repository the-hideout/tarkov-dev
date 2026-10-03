import { useEffect } from "react";
import { useLocation } from "react-router"; // Or 'react-router' in v7

export function useScrollToHash() {
    const { hash } = useLocation();

    useEffect(() => {
        if (hash) {
            // Small timeout ensures the DOM element has finished rendering in React 19
            const id = hash.replace("#", "");
            const element = document.getElementById(id);

            let timeout;
            if (element) {
                timeout = setTimeout(() => {
                    element.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 0);
            }
            return () => clearTimeout(timeout);
        }
    }, [hash]);
}
