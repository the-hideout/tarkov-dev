import { configureStore } from '@reduxjs/toolkit'
import itemsRedcer from './features/items/itemsSlice';
import craftsReducer from './features/crafts/craftsSlice';
import bartersReducer from './features/barters/bartersSlice';
import socketsReducer from './features/sockets/socketsSlice';

export default configureStore({
    reducer: {
        items: itemsRedcer,
        crafts: craftsReducer,
        barters: bartersReducer,
        sockets: socketsReducer,
    },
});