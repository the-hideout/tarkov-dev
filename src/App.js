import React, { useState } from 'react';
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
import data from './data';

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

let typeCache = [];
const legendData = data.map((ammo) => {
    if (typeCache.includes(ammo.type)){
        return false;
    }
    
    typeCache.push(ammo.type);
    
    return {
        name: ammo.type,
        symbol: ammo.symbol,
    }
}).filter(Boolean);

function App() {
    const [listState, setShowData] = useState(data);
    
    console.log(data);
    
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
                    data={listState}
                    x="Damage"
                    y="Penetration Value"
                />
                <VictoryLegend
                    data={legendData}
                    dataComponent = {<Symbol />}
                    events={[{
                        target: "labels",
                        eventHandlers: {
                          onClick: (event, target, index) => {
                            setShowData(data.filter((ammo) => {
                                return ammo.type === legendData[index].name;
                            }));
                          }
                        }
                      }]}
                    gutter={10}
                    orientation="vertical"
                    style={styles.legend}
                    x={290}
                    y={20}
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
