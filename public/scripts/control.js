(() => {
    const mql = window.matchMedia('(min-width: 710px)');
    
    // Big screen, don't do controls
    if(mql.matches){
        return true;
    }
    
    document.querySelector('.connection-wrapper [type="submit"]').addEventListener('click', () => {
        sessionID = document.querySelector('[name="session-id"]').value.toUpperCase();
        sendMessage(buildMessage({
            type: 'command',
            data: {
                type: 'map',
                value: document.querySelector('[name="map"]').value,
            },
        }));
    });
    
    document.querySelector('[name="map"]').addEventListener('change', (event) => {
        sendMessage(buildMessage({
            type: 'command',
            data: {
                type: 'map',
                value: event.target.value,
            },
        }));
    });
    
    document.querySelector('[name="ammo"]').addEventListener('change', (event) => {
        sendMessage(buildMessage({
            type: 'command',
            data: {
                type: 'ammo',
                value: event.target.value,
            }
        }));
    });
})();
