import ReactDOM from "react-dom/client";
// import * as serviceWorker from './serviceWorker';
import App from "./App.jsx";
import store from "./store.js";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import ScrollToTop from "./components/scroll-to-top/index.jsx";

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <Provider store={store}>
        <BrowserRouter>
            <ScrollToTop />
            <QueryClientProvider client={queryClient}>
                <App />
            </QueryClientProvider>
        </BrowserRouter>
    </Provider>,
);
