import React from 'react';
import { VictoryChart, VictoryScatter, VictoryTheme } from 'victory';

import './App.css';
import data from './data.json';

const symbols = [
    {
        match: ['7.62x54R'],
        name: '7.62x54R',
        symbol: {
            fill: 'tomato',
            type: 'triangleUp',
        },
    },
    {
        match: ['7.62'],
        name: '7.62',
        symbol: {
            fill: 'tomato',
            type: 'diamond',
        },
    },
    {
        match: ['5.56'],
        name: '5.56',
        symbol: {
            fill: 'yellow',
            type: 'star',
        },
    },
    {
        match: ['5.45'],
        name: '5.45',
        symbol: {
            fill: 'green',
            type: 'star',
        },
    },
    {
        match: ['9x'],
        name: '9x',
        symbol: {
            fill: 'yellow',
            type: 'plus',
        },
    },
    {
        match: ['12.7'],
        name: '12.7',
        symbol: {
            fill: 'yellow',
            type: 'triangleDown',
        },
    },
    {
        match: ['12/70','20/70'],
        name: 'Shells',
        symbol: {
            fill: 'yellow',
            type: 'circle',
        },
    },
];

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
                            for(const symbolSettings of symbols){
                                for(const match of symbolSettings.match){
                                    if(datum.type.indexOf(match) === 0){
                                        return symbolSettings.symbol.type;
                            }
                            }
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
