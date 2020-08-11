import React from 'react';
import {
    Link
  } from "react-router-dom";
  
function MenuItem(props) {        
    return <li>
        <Link 
            to = {props.to}
        >
            {props.children}
        </Link>
</li>;
}

export default MenuItem;


