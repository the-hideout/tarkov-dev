const makeID = function makeID(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 };

const buildMessage = (data) => {
    return JSON.stringify({
        sessionID: sessionID,
        ...data,
    });
};

let sessionID = makeID(4);
let socket;

document.querySelector('.id-wrapper .session-id').innerHTML = sessionID;

const sendMessage = (message) => {
    socket.send(message);
};

const connect = function connect(){
    socket = new WebSocket(`wss://tarkov-socket-server.herokuapp.com`);
    
    const heartbeat = function heartbeat() {
        clearTimeout(socket.pingTimeout);
       
        // Use `WebSocket#terminate()`, which immediately destroys the connection,
        // instead of `WebSocket#close()`, which waits for the close timer.
        // Delay should be equal to the interval at which your server
        // sends out pings plus a conservative assumption of the latency.
        socket.pingTimeout = setTimeout(() => {
            console.log('terminating');
            socket.terminate();
        }, 10000 + 1000);
    };
    
    socket.addEventListener('message', (rawMessage) => {
        const message = JSON.parse(rawMessage.data);
        
        if(message.type === 'ping'){
            heartbeat();
            
            socket.send(JSON.stringify({type: 'pong'}));
            
            return true;
        }
        
        window.handleDisplayMessage(rawMessage);
    });
    
    socket.addEventListener('open', () => {
        heartbeat();
        
        socket.send(buildMessage({
            type: 'connect',
        }));
        
        console.log('Connected to socket server');
        console.log(socket);
    });   
    
    socket.addEventListener('close', () => {
        console.log('Disconnected from socket server');
        
        clearTimeout(socket.pingTimeout);
    });
    
    setInterval(() => {        
        if(socket.readyState === 3){
            console.log('trying to re-connect');
            connect();
        }
    }, 5000);
};

connect();

