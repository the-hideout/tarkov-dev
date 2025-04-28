import { io, Socket as IOSocket } from 'socket.io-client';

interface ServerToClientEvents {
  'connect_error': (error: Error) => void;
  'disconnect': (reason: string) => void;
  'user:update': (user: any) => void;
  'bot:status': (data: { platform: 'twitch' | 'discord' }) => void;
  'error': (error: Error) => void;
}

interface ClientToServerEvents {
  'subscribe:bot': (platform: 'twitch' | 'discord') => void;
  'unsubscribe:bot': (platform: 'twitch' | 'discord') => void;
}

class SocketService {
  private socket: IOSocket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private listeners: { [key: string]: Function[] } = {};

  constructor() {
    this.connect();
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        this.connect();
      }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1));
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(process.env.REACT_APP_WS_URL || 'ws://localhost:3001', {
      transports: ['websocket'],
      autoConnect: true,
    }) as IOSocket<ServerToClientEvents, ClientToServerEvents>;

    if (!this.socket) return;

    this.socket.on('connect_error', (error: Error) => {
      console.error('WebSocket connection error:', error);
      this.handleReconnect();
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('Disconnected from WebSocket server:', reason);
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        this.connect();
      }
    });

    // Business events
    this.socket.on('user:update', (user: any) => {
      this.emit('user:update', user);
    });

    this.socket.on('bot:status', (data: { platform: 'twitch' | 'discord' }) => {
      this.emit('bot:status', data);
    });

    this.socket.on('error', (error: Error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    });
  }

  public subscribeToBotUpdates(platform: 'twitch' | 'discord') {
    if (!this.socket) return;
    this.socket.emit('subscribe:bot', platform);
  }

  public unsubscribeFromBotUpdates(platform: 'twitch' | 'discord') {
    if (!this.socket) return;
    this.socket.emit('unsubscribe:bot', platform);
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  private emit(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
}

export const socketService = new SocketService(); 