import {Helmet} from 'react-helmet';

import ID from '../ID.jsx';

import './index.css';

function ErrorPage(props) {
    return [
        <Helmet
            key = {'loot-tier-helmet'}
        >
            <meta charSet="utf-8" />
            <title>
                {`Page not found - Escape from Tarkov`}
            </title>
            <meta
                name="description"
                content= {`This is not the page you are looking for`}
            />
        </Helmet>,
        <div
            className="display-wrapper error-page"
            key = {'display-wrapper'}
        >
            <h1>
                Sorry, that page doesn't exist!
            </h1>
        </div>,
        <ID
            key = {'session-id'}
            sessionID = {props.sessionID}
        />
    ];
};

export default ErrorPage;


