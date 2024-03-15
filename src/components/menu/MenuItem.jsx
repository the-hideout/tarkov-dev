import { mdiEarthBox } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useMatch } from 'react-router-dom';

function MenuItem(props) {
    const routeMatch = useMatch('/ammo/:currentAmmo');
    let currentAmmo = '';
    let ammoTypes = [];
    if (routeMatch) {
        currentAmmo = routeMatch.params.currentAmmo;
        ammoTypes = currentAmmo.split(',');
    }

    const [checked, setChecked] = useState(
        ammoTypes.includes(props.displayText),
    );
    const navigate = useNavigate();

    const handleChange = (event) => {
        setChecked(event.currentTarget.checked);

        if (!event.currentTarget.checked) {
            ammoTypes.splice(ammoTypes.indexOf(event.currentTarget.value), 1);
        } else {
            ammoTypes.push(event.currentTarget.value);
            ammoTypes.sort();
        }

        navigate(`${props.prefix}/${ammoTypes.filter(Boolean).join(',')}`);
    };

    useEffect(() => {
        if (currentAmmo) {
            setChecked(currentAmmo.split(',').includes(props.displayText));
        }
        else {
            setChecked(false);
        }
    }, [currentAmmo, props.displayText]);

    const handleClick = (event) => {
        if (props.onClick) {
            props.onClick();
        }
    };

    const getCheckbox = () => {
        if (!props.checkbox) {
            return false;
        }

        return (
            <input
                checked={checked}
                onChange={handleChange}
                type="checkbox"
                value={props.displayText}
            />
        );
    };

    const getIcon = () => {
        if (props.icon) {
            return (
                <Icon path={props.icon} size={1} className="icon-with-text" />
            )
        }
        else if (props.padding) {
            return (
                <Icon path={mdiEarthBox} size={1} className="icon-with-text icon-with-text-hidden" />
            )
        }
    }

    return (
        <li className={props.className}>
            {getCheckbox()}
            {getIcon()}
            <Link to={props.to} onClick={handleClick}>
                {props.displayText}
            </Link>
        </li>
    );
}

export default MenuItem;
