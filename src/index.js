import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {
    BrowserRouter as Router,
} from 'react-router-dom';
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';

if(window.location.hostname !== 'localhost'){
    Sentry.init({
        dsn: 'https://0c31a9f171194843bd9ae061c0856470@o90181.ingest.sentry.io/5407213',
        integrations: [
            new Integrations.BrowserTracing(),
        ],
        tracesSampleRate: 1.0,
    });
}

ReactDOM.render((<Router><App /></Router>), document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
