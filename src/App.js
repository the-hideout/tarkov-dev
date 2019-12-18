import React from 'react';
import { 
    VictoryChart,
    VictoryScatter,
    VictoryTheme,
    VictoryLegend,
    VictoryLine,
    VictoryLabel,
    VictoryAxis
} from 'victory';

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

const styles = {
    classLabel: {
        fontSize: 3,
        fill: '#ddd',
        strokeWidth: 1,
    },
    axis: {
        tickLabels: {
            fontSize: 5,
        },
        grid: {
            stroke: '#555',
        },
    },
    scatter: {
        labels: {
            fontSize: 3,
            fill: '#fff',
        },
    },
    legend: {
        border: { 
            stroke: "black",
        },
        labels: {
            color: '#fff',
            fontSize: 5,
        }
    },
    annoationLine: {
        data: {
            stroke: "white",
            strokeWidth: 0.5,
            strokeDasharray: 1,
        },
        labels: {
            angle: -90,
            fill: "white",
            fontSize: 5,
        }
    },
};

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
        
        if(ammoRow['0.12 Patch'].includes('12.7x108 mm')){
            return false;
        }
        
        return {
            ...ammoRow,
            'Penetration Value': Number(ammoRow['Penetration Value']),
            'Damage': Number(ammoRow['Damage']),
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
                height={250}
                theme={VictoryTheme.material}
            >
                <VictoryAxis
                    tickValues={[10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 240]}
                    style = {styles.axis}
                />
                <VictoryAxis
                    dependentAxis
                    tickValues={[10, 20, 30, 40, 50, 60, 70]}
                    style = {styles.axis}
                />
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
                    style={styles.scatter}
                    labels={({ datum }) => datum.name}
                    size={2}
                    data={ localData }
                    x="Damage"
                    y="Penetration Value"
                />
                <VictoryLegend
                    x={290}
                    // height={150}
                    y={20}
                    orientation="vertical"
                    gutter={10}
                    style={styles.legend}
                    data={symbols}
                />
                <VictoryLine
                    style={styles.annoationLine}
                    labels={["Chest HP"]}
                    labelComponent={
                        <VictoryLabel
                            y={120}
                            x={125}
                        />
                    }
                    x={() => 80}
                />
                <VictoryLabel
                    text="Class 1"
                    style= {styles.classLabel}
                    datum={{ x: 5, y: 11 }}
                    textAnchor="start"
                    verticalAnchor="end"
                />
                <VictoryLabel
                    text="Class 2"
                    style= {styles.classLabel}
                    datum={{ x: 5, y: 21 }}
                    textAnchor="start"
                    verticalAnchor="end"
                />
                <VictoryLabel
                    text="Class 3"
                    style= {styles.classLabel}
                    datum={{ x: 5, y: 31 }}
                    textAnchor="start"
                    verticalAnchor="end"
                />
                <VictoryLabel
                    text="Class 4"
                    style= {styles.classLabel}
                    datum={{ x: 5, y: 41 }}
                    textAnchor="start"
                    verticalAnchor="end"
                />
                <VictoryLabel
                    text="Class 5"
                    style= {styles.classLabel}
                    datum={{ x: 5, y: 51 }}
                    textAnchor="start"
                    verticalAnchor="end"
                />
                <VictoryLabel
                    text="Class 6"
                    style= {styles.classLabel}
                    datum={{ x: 5, y: 61 }}
                    textAnchor="start"
                    verticalAnchor="end"
                />
            </VictoryChart>
        </div>
    );
}
    
export default App;
