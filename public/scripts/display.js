(() => {
    const maps = {
        dorms: 'dorms.jpg',
        customs: 'customs.jpg',
        interchange: 'interchange.jpg',
        woods: 'woods.jpg',
        factory: 'factory.jpg',
        reserve: 'reserve.jpg',
        shoreline: 'shoreline.jpg',
        resort: 'resort.jpg',
    };
    
    const mql = window.matchMedia('(min-width: 710px)');
    
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
        
        let ammoNode = document.querySelector('.display-wrapper #root');
        let mapNode = document.querySelector('.display-wrapper img');
        
        if(message.data.type === 'map'){
            
            if(ammoNode){
                ammoChart = ammoNode.parentElement.removeChild(ammoNode);
            }
            
            if(mapNode){
                mapNode.setAttribute('src', './maps/' + maps[message.data.value]);
            } else {
                document.querySelector('.display-wrapper').innerHTML = '<img src="./maps/' + maps[message.data.value] + '">';
            }

            
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
