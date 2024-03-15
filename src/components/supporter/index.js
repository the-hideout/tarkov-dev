import { ReactComponent as PatreonIcon } from './Patreon.svg';
import { ReactComponent as GithubIcon } from './Github.svg';

import './index.css';

function Supporter(props) {
    const supporterTypes = [];

    if (props.github) {
        supporterTypes.push(<GithubIcon key="github" />);
    }

    if (props.patreon) {
        supporterTypes.push(<PatreonIcon key="patreon" />);
    }

    return (
        <div className={`supporter-wrapper ${props.inline ? 'inline' : ''}`}>
            {props.link && (
                <a href={props.link} target="_blank" rel="noopener noreferrer">
                    <div className="supporter-name-wrapper">{props.name}</div>
                    {supporterTypes}
                </a>
            )}
            {!props.link && (
                <span>
                    <div className="supporter-name-wrapper">{props.name}</div>
                    {supporterTypes}
                </span>
            )}
        </div>
    );
}

export default Supporter;
