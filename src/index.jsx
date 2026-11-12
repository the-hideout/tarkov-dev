import ReactDOM from "react-dom/client";
// import * as serviceWorker from './serviceWorker';
import App from "./App.jsx";
import store from "#src/store";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router";

import ScrollToTop from "./components/scroll-to-top/index.jsx";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <Provider store={store}>
        <BrowserRouter>
            <ScrollToTop />
            <App />
        </BrowserRouter>
    </Provider>,
);
