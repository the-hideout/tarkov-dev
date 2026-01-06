import { useState, useEffect } from 'react';

/**
 * A hook to determine how many menu items can fit in a container.
 * @param {React.RefObject} containerRef The ref of the container that restricts the width.
 * @param {React.RefObject} measuringRef The ref of a "ghost" element containing all items for measurement.
 * @param {Array} items The list of menu items.
 */
const useMenuOverflow = (containerRef, measuringRef, items) => {
    const [visibleCount, setVisibleCount] = useState(items.length);

    useEffect(() => {
        if (!containerRef.current || !measuringRef.current) return;

        const measure = () => {
            if (!containerRef.current || !measuringRef.current) return;

            const containerWidth = containerRef.current.offsetWidth;

            // Get all immediate kids of the ghost/measuring element
            const children = Array.from(measuringRef.current.children);
            if (children.length === 0) return;

            // Estimate "More" menu width
            // This button is only rendered in the real menu, but we need to reserve space for it
            const MORE_BUTTON_WIDTH = 100;
            const GAP = 15; // Matches .desktop-menu gap

            let currentWidth = 0;
            let count = 0;

            for (let i = 0; i < items.length; i++) {
                const child = children[i];
                if (!child) break;

                const childWidth = child.getBoundingClientRect().width;
                const isLast = i === items.length - 1;

                const neededWidth = currentWidth + childWidth + (count > 0 ? GAP : 0);

                // If it's not the last item, we need to ensure there's space for the "More" button
                const buffer = isLast ? 0 : MORE_BUTTON_WIDTH + GAP;

                if (neededWidth + buffer > containerWidth) {
                    break;
                }

                currentWidth = neededWidth;
                count++;
            }

            setVisibleCount((prev) => (prev !== count ? count : prev));
        };

        if (typeof ResizeObserver === 'undefined') {
            measure();
            return;
        }

        const observer = new ResizeObserver(() => {
            window.requestAnimationFrame(measure);
        });

        observer.observe(containerRef.current);

        // Initial measure
        measure();

        return () => observer.disconnect();
    }, [containerRef, measuringRef, items]);

    return { visibleCount };
};

export default useMenuOverflow;
