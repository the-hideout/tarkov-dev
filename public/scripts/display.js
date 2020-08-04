(() => {
    const maps = {
        'customs': '<img src="./maps/customs.png">',
        'interchange': '<img src="./maps/interchange.jpg">',
        'woods': '<img src="./maps/woods.png">',
        'factory': '<img src="./maps/factory.png">',
        'reserve': '<img src="./maps/reserve.jpg">',
        'shoreline': '<img src="./maps/shoreline.jpg">',
        'resort': '<img src="./maps/resort.png">',
    };
    
    const mql = window.matchMedia('(min-width: 760px)');
    
    // Small screen, don't do display
    if(!mql.matches){
        return true;
    }
    
    let ammoChart = false;
    
    window.handleDisplayMessage = (rawMessage) => {
        const message = JSON.parse(rawMessage.data);
        
        if(message.type !== 'command'){
            return false;
        }
        
        let ammoNode = document.querySelector('.display-wrapper #root')
        
        if(message.data.type === 'map'){
            
            if(ammoNode){
                ammoChart = ammoNode.parentElement.removeChild(ammoNode);
            }
            document.querySelector('.display-wrapper').innerHTML = maps[message.data.value];
            
            return true;
        }
        
        if(message.data.type === 'ammo'){
            if(ammoChart){
                document.querySelector('.display-wrapper').innerHTML = '';
                document.querySelector('.display-wrapper').appendChild(ammoChart);
                ammoChart = false;
            }
            
            history.replaceState(undefined, undefined, `#${message.data.value}`);
            window.dispatchEvent(new HashChangeEvent('hashchange'));
            
            return true;
        }
    }
})();
