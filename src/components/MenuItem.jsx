import React from 'react';
function MenuItem(props) {        
    return <li
            onClick = {props.handleClick}
        >
        <button>
            {props.children}
        </button>
</li>;
}

export default MenuItem;


