import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import settingsReducer from './slices/settingsSlice';
import botReducer from './slices/botSlice';
import analyticsReducer from './slices/analyticsSlice';
import { socketMiddleware, setupSocketListeners } from './socketMiddleware';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    settings: settingsReducer,
    bot: botReducer,
    analytics: analyticsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(socketMiddleware),
});

// Setup socket listeners after store is created
setupSocketListeners(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 