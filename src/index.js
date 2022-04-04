import ReactDOM from 'react-dom';
import App from './App';
// import * as serviceWorker from './serviceWorker';
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import store from './store';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';

import ScrollToTop from './components/scroll-to-top';

const queryClient = new QueryClient();

if (
    window.location.hostname !== 'localhost' &&
    window.location.protocol !== 'file:'
) {
    Sentry.init({
        dsn: "https://042050af77074111a620487037525e25@o1189140.ingest.sentry.io/6309398",
        integrations: [new BrowserTracing()],
        tracesSampleRate: 1.0,
        // release: process.env.npm_package_version,
    });

}

ReactDOM.render(
    <Provider store={store}>
        <Router>
            <ScrollToTop />
            <QueryClientProvider client={queryClient}>
                <App />
            </QueryClientProvider>
        </Router>
    </Provider>,
    document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
