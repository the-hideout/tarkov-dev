declare module 'socket.io-client' {
  export interface Socket<ListenEvents = any, EmitEvents = any> {
    connected: boolean;
    disconnected: boolean;
    io: any;
    id: string;
    auth: any;
    
    connect(): Socket<ListenEvents, EmitEvents>;
    disconnect(): Socket<ListenEvents, EmitEvents>;
    emit<Ev extends keyof EmitEvents>(ev: Ev, ...args: Parameters<EmitEvents[Ev]>): boolean;
    on<Ev extends keyof ListenEvents>(ev: Ev, listener: ListenEvents[Ev]): this;
    once<Ev extends keyof ListenEvents>(ev: Ev, listener: ListenEvents[Ev]): this;
    off<Ev extends keyof ListenEvents>(ev: Ev, listener?: ListenEvents[Ev]): this;
    removeListener<Ev extends keyof ListenEvents>(ev: Ev, listener?: ListenEvents[Ev]): this;
    removeAllListeners<Ev extends keyof ListenEvents>(ev?: Ev): this;
    listeners<Ev extends keyof ListenEvents>(ev: Ev): ListenEvents[Ev][];
    hasListeners<Ev extends keyof ListenEvents>(ev: Ev): boolean;
  }

  const io: {
    (url: string, opts?: any): Socket;
    default: typeof io;
  };

  export default io;
  export { io };
} 