import { configureStore } from '@reduxjs/toolkit';
import { itemsReducer } from './features/items';
import { craftsReducer } from './features/crafts';
import { bartersReducer } from './features/barters';
import { hideoutReducer } from './features/hideout';
import { metaReducer } from './features/meta';
import { questsReducer } from './features/quests';
import { tradersReducer } from './features/traders';
import { bossesReducer } from './features/bosses';
import { mapsReducer } from './features/maps';
import socketsReducer from './features/sockets/socketsSlice';
import settingsReducer from './features/settings/settingsSlice';

export default configureStore({
    reducer: {
        items: itemsReducer,
        crafts: craftsReducer,
        barters: bartersReducer,
        hideout: hideoutReducer,
        meta: metaReducer,
        quests: questsReducer,
        traders: tradersReducer,
        bosses: bossesReducer,
        maps: mapsReducer,
        sockets: socketsReducer,
        settings: settingsReducer,
    },
});
