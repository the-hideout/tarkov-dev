import React from 'react';

import {ReactComponent as PatreonIcon} from './Patreon.svg';
import {ReactComponent as GithubIcon} from './Github.svg';

function Supporter(props) {    
    const supporterTypes = [];
    
    if(props.patreon){
        supporterTypes.push(<PatreonIcon />);
    }
    
    if(props.github){
        supporterTypes.push(<GithubIcon />);
    }
    
    return <div
        className = {'supporter-wrapper'}
    >
        {props.name}
        {supporterTypes}
    </div>
}

export default Supporter;


