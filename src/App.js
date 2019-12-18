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
import Symbol from './Symbol.jsx';
import symbols from './symbols';
import data from './data.json';

const MAX_DAMAGE = 200;

const styles = {
    classLabel: {
        fontSize: 3,
        fill: '#ddd',
        strokeWidth: 1,
    },
    xaxis: {
        tickLabels: {
            fontSize: 5,
        },
        grid: {
            stroke: '#555',
        },
    },
    yaxis: {
        tickLabels: {
            fontSize: 5,
        },
        grid: {
            stroke: '#ddd',
        },
    },
    scatter: {
        labels: {
            fontSize: 2.5,
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
        
        const returnData = {
            ...ammoRow,
            'Penetration Value': Number(ammoRow['Penetration Value']),
            'Damage': Number(ammoRow['Damage']),
            ...getTypeAndName(ammoRow['0.12 Patch']),
        };
        
        if(returnData.Damage > MAX_DAMAGE){
            returnData.name = `${returnData.name} (${returnData.Damage})`;
            returnData.Damage = MAX_DAMAGE;
        }
        
        return returnData;
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
                maxDomain = {{
                    y: 70,
                    x: MAX_DAMAGE,
                }}
            >
                <VictoryAxis
                    tickValues={[10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 240]}
                    style = {styles.xaxis}
                />
                <VictoryAxis
                    dependentAxis
                    tickValues={[10, 20, 30, 40, 50, 60, 70]}
                    style = {styles.yaxis}
                />
                <VictoryScatter
                    dataComponent = {<Symbol />}
                    style={styles.scatter}
                    labelComponent={<VictoryLabel dy={-3} />}
                    labels={({ datum }) => {
                        return datum.name;
                    }}
                    size={1}
                    data={ localData }
                    x="Damage"
                    y="Penetration Value"
                />
                <VictoryLegend
                    x={290}
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
                            y={125}
                            x={147}
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
