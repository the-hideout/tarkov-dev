import { Middleware } from '@reduxjs/toolkit';
import { socketService } from '../services/socketService';
import { updateProfile } from './slices/authSlice';
import { getBotStatus } from './slices/botSlice';

export const setupSocketListeners = (store: any) => {
  socketService.on('user:update', (user: any) => {
    store.dispatch(updateProfile(user));
  });

  socketService.on('bot:status', (data: { platform: 'twitch' | 'discord' }) => {
    store.dispatch(getBotStatus(data.platform));
  });
};

export const socketMiddleware: Middleware = store => next => action => {
  // Handle auth state changes
  if (action.type === 'auth/login/fulfilled' || action.type === 'auth/register/fulfilled') {
    socketService.connect();
  } else if (action.type === 'auth/logout') {
    socketService.disconnect();
  }

  return next(action);
}; 