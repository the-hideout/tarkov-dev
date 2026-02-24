const socketServer = "wss://socket.tarkov.dev";
//const socketServer = 'ws://localhost:8080';

class RemoteWebSocket extends WebSocket {
    constructor(sessionId) {
        super(socketServer + `?sessionid=${encodeURIComponent(sessionId)}`);

        this.addEventListener("open", () => {
            this.heartbeat();
        });

        this.addEventListener("message", (rawMessage) => {
            const message = JSON.parse(rawMessage.data);

            if (message.type !== "ping") {
                return;
            }
            this.heartbeat();

            this.send(JSON.stringify({ type: "pong" }));
        });

        this.addEventListener("close", () => {
            clearTimeout(this.pingTimeout);
        });
    }

    heartbeat() {
        clearTimeout(this.pingTimeout);

        // Delay should be equal to the interval at which your server
        // sends out pings plus a conservative assumption of the latency.
        this.pingTimeout = setTimeout(() => {
            this.close(4000, "Heartbeat timeout");
        }, 40000 + 1000);
    }
}

export default RemoteWebSocket;
