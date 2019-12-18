import React from 'react';
import { VictoryChart, VictoryScatter, VictoryTheme } from 'victory';

import './App.css';
import data from './data.json';

function getTypeAndName(name) {
    
    if(name.includes('.366')) {
        return {
            type: '0.366',
            name: name.replace( '.366 ', '' ),
        };
    }
    
    if(name.includes('12/70')) {
        return {
            type: '12/70',
            name: name.replace( '12/70 ', '' ),
        };
    }
    
    if(name.includes('20/70')) {
        return {
            type: '20/70',
            name: name.replace( '20/70 ', '' ),
        };
    }
    
    const matches = name.match( /\d{1,2}(\.\d{1,2})?x\d*(\s?mm)?R?/ );
    
    return {
        type: matches[ 0 ],
        name: name.replace( `${matches[ 0 ]}`, '' ).trim(),
    };
}

function parseData(){
    return data.map((ammoRow) => {
        if(!ammoRow.Damage){
            return false;
        }
        
        return {
            ...ammoRow,
            'Penetration Value': Number(ammoRow['Penetration Value']),
            ...getTypeAndName(ammoRow['0.12 Patch']),
        };
    }).filter(Boolean);
}


function App() {
    const localData = parseData();
    return (
        <div className="App">
            <VictoryChart
                domainPadding={10}
                padding={20}
                height={200}
                theme={VictoryTheme.material}
            >
                <VictoryScatter
                    symbol={
                        ({ datum }) => {
                            if (datum.type.indexOf('7.62x54R') === 0){
                                return 'triangleUp';
                            }
                            
                            if (datum.type.indexOf('7.62') === 0){
                                return 'diamond';
                            }
                            
                            if (datum.type.indexOf('5.56') === 0){
                                return 'star';
                            }
                            
                            // Same icon, should be different color
                            if (datum.type.indexOf('5.45') === 0){
                                return 'star';
                            }
                            
                            if (datum.type.indexOf('9x') === 0){
                                return 'plus';
                            }
                            
                            if (datum.type.indexOf('12.7') === 0){
                                return 'triangleDown';
                            }
                            
                            if (datum.type.indexOf('12/70') === 0 || datum.type.indexOf('20/70') === 0){
                                return 'circle';
                            }
                            
                            console.log(`No symbol defined for ${datum.type}`);
                            
                            return 'minus';
                        }
                    }
                    style={{
                        labels: {
                          fontSize: 3,
                          fill: '#fff',
                        }
                      }}
                    labels={({ datum }) => datum.name}
                    size={2}
                    data={ localData }
                    x="Damage"
                    y="Penetration Value"
                />
            </VictoryChart>
        </div>
    );
}
    
export default App;
