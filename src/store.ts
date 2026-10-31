import { configureStore } from "@reduxjs/toolkit";

import { itemsReducer } from "./features/items/index.js";
import { craftsReducer } from "./features/crafts/index.js";
import { bartersReducer } from "./features/barters/index.js";
import { hideoutReducer } from "./features/hideout/index.js";
import { questsReducer } from "./features/quests/index.js";
import { tradersReducer } from "./features/traders/index.js";
import { mapsReducer } from "./features/maps/index.js";
import { seasonReducer } from "./features/season/index.js";
import { statusReducer } from "./features/status/index.mjs";
import socketsReducer from "#src/features/sockets/socketsSlice";
import settingsReducer from "./features/settings/settingsSlice.mjs";

const store = configureStore({
    reducer: {
        items: itemsReducer,
        crafts: craftsReducer,
        barters: bartersReducer,
        hideout: hideoutReducer,
        quests: questsReducer,
        traders: tradersReducer,
        maps: mapsReducer,
        sockets: socketsReducer,
        settings: settingsReducer,
        status: statusReducer,
        season: seasonReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            immutableCheck: false,
            serializableCheck: false,
        }),
});

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export default store;
