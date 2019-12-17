import React from 'react';
import { VictoryChart, VictoryScatter, VictoryTheme } from 'victory';

import logo from './logo.svg';
import './App.css';
import data from './data.json';

function getType(name) {
    if(name.includes('.366')) {
        return '0.366';
    }
    
    if(name.includes('5.45x39')) {
        return '5.45x39mm';
    }
    
    if(name.includes('5.45x39')) {
        return '5.45x39mm';
    }
    
    if(name.includes('5.56x45')) {
        return '5.56x45mm';
    }
    
    if(name.includes('5.7x28')) {
        return '5.7x28mm';
    }
    
    if(name.includes('7.62x25')) {
        return '7.62x25mm';
    }
    
    if(name.includes('7.62x39')) {
        return '7.62x39mm';
    }
    
    if(name.includes('7.62x51')) {
        return '7.62x51mm';
    }
    
    if(name.includes('7.62x54R')) {
        return '7.62x54R';
    }
    
    if(name.includes('9x18')) {
        return '9x18mm';
    }
    
    if(name.includes('9x19')) {
        return '9x19mm';
    }
    
    if(name.includes('9x21')) {
        return '9x21mm';
    }
    
    if(name.includes('9x39')) {
        return '9x39mm';
    }
}

function parseData(){
    return data.map((ammoRow) => {
        if(!ammoRow.Damage){
            return false;
        }
        
        return {
            ...ammoRow,
            'Penetration Value': Number(ammoRow['Penetration Value']),
            type: getType(ammoRow['0.12 Patch']),
        };
    }).filter(Boolean);
}


function App() {
    const localData = parseData();
    return (
        <div className="App">
            <VictoryChart
                theme={VictoryTheme.material}
            >
                <VictoryScatter
                    symbol={
                        ({ datum }) => {
                            if (datum.type === '9x39mm'){
                                return 'triangleUp';
                            }
                            
                            if (datum.type === '9x21mm'){
                                return 'diamond';
                            }
                            
                            if (datum.type === '9x19mm'){
                                return 'triangleDown';
                            }
                            
                            if (datum.type === '9x18mm'){
                                return 'circle';
                            }
                            
                            if (datum.type === '7.62x54R'){
                                return 'plus';
                            }
                            
                            if (datum.type === '7.62x51mm'){
                                return 'minus';
                            }
                            
                            if (datum.type === '7.62x39mm'){
                                return 'square';
                            }
                            
                            if (datum.type === '7.62x25mm'){
                                return 'star';
                            }
                            
                            return 'triangleDown';
                        }
                    }
                    size={1}
                    data={ localData }
                    x="Damage"
                    y="Penetration Value"
                />
            </VictoryChart>
        </div>
    );
}
    
export default App;
