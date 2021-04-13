import {ReactComponent as PatreonIcon} from './Patreon.svg';
import {ReactComponent as GithubIcon} from './Github.svg';

function Supporter(props) {
    const supporterTypes = [];

    if(props.patreon){
        supporterTypes.push(<PatreonIcon
            key = 'patreon'
        />);
    }

    if(props.github){
        supporterTypes.push(<GithubIcon
            key = 'github'
        />);
    }

    return <div
        className = {'supporter-wrapper'}
    >
        {props.link && <a
            href = {props.link}
        >
            {props.name}
            {supporterTypes}
        </a>}
        {!props.link && <span>
            {props.name}
            {supporterTypes}
        </span>}
    </div>
}

export default Supporter;


