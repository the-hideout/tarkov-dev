import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from "@material-ui/core";

export default function SubMenu({key, label, to, children}) {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <li key={key} data-targetid={key}>
            <Link 
                className="submenu-wrapper" 
                to={to}
                onClick={handleClick}
                onMouseOver={handleClick}
                onMouseLeave={(event) => {
                    let parent = event.currentTarget.parentElement;
                    while (parent) {
                        if (parent.classList.contains('overflow-menu')) {
                        return;
                        }
                    }
                    handleClose();
                }}
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
                transformOrigin={{horizontal: 'right', vertical: 'top'}}
                anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
            >
                {}
            </Menu>
        </li>
    );
}
