import React, { useState, useMemo } from "react";
import { Link } from 'react-router-dom';
import { Menu } from "@material-ui/core";
import Icon from '@mdi/react';
import { mdiDotsVertical } from '@mdi/js';
import { useTranslation } from 'react-i18next';
import classnames from "classnames";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
  inOverflowMenu: {
    "&:hover": {
      backgroundColor: "transparent"
    }
  }
}));

export default function OverflowMenu({ children, className, visibilityMap }) {
    const { t } = useTranslation();
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const classes = useStyles();
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const shouldShowMenu = useMemo(() => 
        Object.values(visibilityMap).some((v) => v === false),
    [visibilityMap]);
    
    if (!shouldShowMenu) {
        return null;
    }
  return (
    <li className={className}>
      <Link
            alt={t('More')}
            to="#"
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
            <Icon path={mdiDotsVertical} size={1} className="icon-with-text" />
        </Link>
      <Menu
        id="long-menu"
        className="overflow-menu"
        anchorEl={anchorEl}
        getContentAnchorEl={null}
        keepMounted
        open={open}
        onClose={handleClose}
        onMouseLeave={handleClose}
        transformOrigin={{horizontal: 'right', vertical: 'top'}}
        anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
      >
        {React.Children.map(children, (child) => {
          if (!visibilityMap[child.props["data-targetid"]]) {
            return (
              React.cloneElement(child, {
                className: classnames(child.className, classes.inOverflowMenu)
              })
            );
          }
          return null;
        })}
      </Menu>
    </li>
  );
}
