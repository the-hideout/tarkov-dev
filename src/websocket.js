// src/websocket.js

const WEBSOCKET_URL = 'ws://localhost:12345';

let socket = null;

export function connectWebSocket(onMessage = console.log) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        console.warn('WebSocket already connected.');
        return;
    }

    socket = new WebSocket(WEBSOCKET_URL);

    socket.onopen = () => {
        console.log('WebSocket connection opened.');
        alert("connected")
    };

    socket.onmessage = (event) => {
        try {
            onMessage(event);
        } catch (err) {
            console.error('Failed to parse WebSocket message:', event.data, err);
        }
    };


    socket.onclose = (event) => {
        console.log('WebSocket connection closed:', event.reason || 'No reason');
    };

    socket.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
}

export function sendMessage(message) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(message);
    } else {
        console.warn('WebSocket is not open. Cannot send message.');
    }
}

export function closeWebSocket() {
    if (socket) {
        socket.close();
    }
}
