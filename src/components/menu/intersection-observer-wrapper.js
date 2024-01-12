import React, { useRef, useEffect, useState } from 'react';
import classnames from 'classnames';

import OverflowMenu from './overflow-menu.js';

export default function IntersectionObserverWrapper({ children }) {
    const navRef = useRef(null);
    const [visibilityMap, setVisibilityMap] = useState({});
    const handleIntersection = (entries) => {
        const updatedEntries = {};
        entries.forEach((entry) => {
            const targetid = entry.target.dataset.targetid;
            if (entry.isIntersecting) {
                updatedEntries[targetid] = true;
            } else {
                updatedEntries[targetid] = false;
            }
        });

        setVisibilityMap((prev) => ({
            ...prev,
            ...updatedEntries,
        }));
    };
    useEffect(() => {
        const observer = new IntersectionObserver(handleIntersection, {
            root: navRef.current,
            threshold: 1,
        });
        // We are addting observers to child elements of the container div
        // with ref as navRef. Notice that we are adding observers
        // only if we have the data attribute targetid on the child element
        Array.from(navRef.current.children).forEach((item) => {
            if (item.dataset.targetid) {
                observer.observe(item);
            }
        });
        return () => {
            observer.disconnect();
        };
    }, []);
    return (
        <div className="toolbar-wrapper" ref={navRef}>
            {React.Children.map(children, (child) => {
                return React.cloneElement(child, {
                    className: classnames(child.props.className, {
                        'visible-menu-item visible-menu-all':
                            !!visibilityMap[child.props['data-targetid']],
                        'invisible-menu-item': !visibilityMap[child.props['data-targetid']],
                        //[classes.showOverflow]: visible && showOverflow
                    }),
                });
            })}
            <OverflowMenu
                visibilityMap={visibilityMap}
                className="submenu-wrapper overflow-menu more-dropdown-wrapper"
            >
                {children}
            </OverflowMenu>
        </div>
    );
}
