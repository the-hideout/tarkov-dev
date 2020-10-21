import React, {useState, useEffect} from 'react';
import {
    Link,
    useParams,
    useHistory,
  } from "react-router-dom";
  
function MenuItem(props) {   
    const {currentAmmo} = useParams();
    let ammoTypes = currentAmmo?.split(',');
    if(!ammoTypes){
        ammoTypes = [];
    }
    const [checked, setChecked] = useState(ammoTypes.includes(props.displayText));   
    const history = useHistory();
    
    const handleChange = (event) => {
        setChecked(event.currentTarget.checked);
        
        if(!event.currentTarget.checked){
            ammoTypes.splice(ammoTypes.indexOf(event.currentTarget.value), 1);
        } else {
            ammoTypes.push(event.currentTarget.value);
            ammoTypes.sort();
        }

        history.push(`${props.prefix}/${ammoTypes.join(',')}`);
    };
    
    useEffect(() => {        
        if(currentAmmo){
            setChecked(currentAmmo.split(',').includes(props.displayText));    
        }
    }, [currentAmmo, props.displayText]);
    
    const handleClick = (event) => {
        console.log(event);
    };
    
    const getCheckbox = () => {
        if(!props.checkbox){
            return false;
        }
        
        return <input
            checked = {checked}
            onChange = {handleChange}
            type="checkbox"
            value={props.displayText}
        />;
    }
    
    return <li>
        {getCheckbox()}
        <Link 
            to = {props.to}
            onClick = {handleClick}
        >
            {props.displayText}
        </Link>
    </li>;
}

export default MenuItem;


