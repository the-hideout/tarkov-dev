import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from "@material-ui/core";

const SubMenu = React.forwardRef(({target, label, to, children}, ref) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <li data-targetid={target} className="submenu-wrapper" ref={ref}>
            <Link 
                to={to}
                onClick={handleClick}
                /*onMouseOver={handleClick}
                onMouseLeave={(event) => {
                    let parent = event.currentTarget.parentElement;
                    while (parent) {
                        if (parent.classList.contains('overflow-menu')) {
                        return;
                        }
                    }
                    handleClose();
                }}*/
            >
                {label}
            </Link>
            <Menu
                className="sub-menu"
                anchorEl={anchorEl}
                getContentAnchorEl={null}
                keepMounted
                open={open}
                onClose={handleClose}
                onMouseLeave={handleClose}
                transformOrigin={{horizontal: 'left', vertical: 'top'}}
                anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
            >
                {children}
            </Menu>
        </li>
    );
});

export default SubMenu;
