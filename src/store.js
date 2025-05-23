import { configureStore } from '@reduxjs/toolkit';

import { itemsReducer } from './features/items/index.js';
import { craftsReducer } from './features/crafts/index.js';
import { bartersReducer } from './features/barters/index.js';
import { hideoutReducer } from './features/hideout/index.js';
import { metaReducer } from './features/meta/index.js';
import { questsReducer } from './features/quests/index.js';
import { tradersReducer } from './features/traders/index.js';
import { bossesReducer } from './features/bosses/index.js';
import { mapsReducer } from './features/maps/index.js';
import { achievementsReducer } from './features/achievements/index.js';
import { statusReducer } from './features/status/index.mjs';
import socketsReducer from './features/sockets/socketsSlice.js';
import settingsReducer from './features/settings/settingsSlice.mjs';

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
        achievements: achievementsReducer,
        sockets: socketsReducer,
        settings: settingsReducer,
        status: statusReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        immutableCheck: false,
        serializableCheck: false,
    }),
});
