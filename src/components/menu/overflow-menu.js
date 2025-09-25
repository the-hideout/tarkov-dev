import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from '@mui/material';
import { Icon } from '@mdi/react';
import { mdiDotsVertical } from '@mdi/js';
import { useTranslation } from 'react-i18next';
import classnames from 'classnames';

export default function OverflowMenu({ children, className, visibilityMap }) {
    const { t } = useTranslation();
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const triggerRef = useRef(null);
    const menuRef = useRef(null);

    useEffect(() => {
        if (!open) return undefined;

        const onPointerMove = (e) => {
            try {
                const pt = { x: e.clientX, y: e.clientY };
                const triggerNode = triggerRef.current;
                const menuNode = menuRef.current; // MenuList node captured via MenuListProps.ref

                const isInside = (node) => {
                    if (!node) return false;
                    const rect = node.getBoundingClientRect();
                    return (
                        pt.x >= rect.left &&
                        pt.x <= rect.right &&
                        pt.y >= rect.top &&
                        pt.y <= rect.bottom
                    );
                };

                if (!isInside(triggerNode) && !isInside(menuNode)) {
                    handleClose();
                }
            } catch (err) {
                // swallow any errors from node access
            }
        };

        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerdown', onPointerMove);

        return () => {
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerdown', onPointerMove);
        };
    }, [open]);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleItemClick = (event) => {
        setAnchorEl(null);
    };

    const shouldShowMenu = useMemo(
        () => Object.values(visibilityMap).some((v) => v === false),
        [visibilityMap],
    );

    // ensure className is a string
    className =
        (className || '').trim() +
        ` ${shouldShowMenu ? 'visible-overflow visible-menu-all' : 'invisible-overflow'}`;
    return (
        <li className={className} ref={triggerRef}>
            <Link alt={t('More')} to="#" onClick={handleClick} onMouseEnter={handleClick}>
                <Icon path={mdiDotsVertical} size={1} className="icon-with-text" />
            </Link>
            <Menu
                id="long-menu"
                className="overflow-menu"
                anchorEl={anchorEl}
                keepMounted
                open={open}
                onClose={handleClose}
                // close the menu when the mouse leaves the menu list
                MenuListProps={{
                    onMouseLeave: handleClose,
                    // don't autofocus items when opening via hover/click combination
                    disableAutoFocusItem: true,
                    ref: (node) => {
                        // MenuList is wrapped; store the list node when available
                        menuRef.current = node;
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                // Menu's own ref is not the list; MenuListProps.ref will capture list node
            >
                {React.Children.map(children, (child) => {
                    if (!visibilityMap[child.props['data-targetid']]) {
                        return React.cloneElement(child, {
                            className: classnames(child.className, 'in-overflow-menu'),
                            onClick: handleItemClick,
                        });
                    }
                    return null;
                })}
            </Menu>
        </li>
    );
}
