import { useEffect } from 'react';
import { socketService } from '../services/socketService';

export const useWebSocket = () => {
  useEffect(() => {
    return () => {
      socketService.disconnect();
    };
  }, []);

  return {
    connect: socketService.connect.bind(socketService),
    disconnect: socketService.disconnect.bind(socketService),
  };
}; 