import { configureStore } from '@reduxjs/toolkit';
import itemsReducer from './features/items/itemsSlice';
import craftsReducer from './features/crafts/craftsSlice';
import bartersReducer from './features/barters/bartersSlice';
import hideoutReducer from './features/hideout/hideoutSlice';
import socketsReducer from './features/sockets/socketsSlice';
import settingsReducer from './features/settings/settingsSlice';

export default configureStore({
    reducer: {
        items: itemsReducer,
        crafts: craftsReducer,
        barters: bartersReducer,
        hideout: hideoutReducer,
        sockets: socketsReducer,
        settings: settingsReducer,
    },
});
