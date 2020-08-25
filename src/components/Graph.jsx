import React, {useMemo} from 'react';
import {
    VictoryChart,
    VictoryScatter,
    VictoryTheme,
    VictoryLegend,
    VictoryLine,
    VictoryLabel,
    VictoryAxis,
} from 'victory';

import Symbol from './Symbol.jsx';

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
        axisLabel: {
            fontSize: 4, 
            padding: 5,
            fill: '#ccc',
        },
    },
    yaxis: {
        tickLabels: {
            fontSize: 5,
        },
        grid: {
            stroke: '#555',
        },
        axisLabel: {
            fontSize: 4, 
            padding: 5,
            fill: '#ccc',
        },
    },
    scatter: {
        labels: {
            fontSize: 2.5,
            fill: '#ccc',
        },
    },
    legend: {
        border: {
            stroke: "black",
            fill: '#292525',
            width: 33,
        },
        labels: {
            fill: '#ccc',
            fontSize: 3,
            cursor: 'pointer',
        },
        title: {
            fill: '#ccc',
            fontSize: 4,
            padding: 2
        },
    },
    annoationLine: {
        data: {
            stroke: "#888",
            strokeWidth: 0.5,
            strokeDasharray: 1,
        },
        labels: {
            angle: -90,
            fill: "#ccc",
            fontSize: 3,
        }
    },
};

const LegendLabel = props => {
    const { selectedDatumName, datum } = props;
    const style = useMemo(() => {
        let style = props.style;

        if (selectedDatumName.includes(datum.name)) {
            style = {
                ...props.style,
                textDecoration: "underline",
                fill: "#fff"
            };
        }

        return style;
    }, [selectedDatumName, datum.name, props.style]);

    return <VictoryLabel {...props} style={style} />;
};

const Graph = props => {
    return (
        <VictoryChart
            domainPadding={10}
            padding={{
                top: 10,
                bottom: 20,
                right: 50,
                left: 20,
            }}
            height={180}
            theme={VictoryTheme.material}
            maxDomain = {{
                y: 70,
                x: props.yMax,
            }}
            // containerComponent={<VictoryVoronoiContainer/>}
            // animate={{ duration: 2000, easing: "bounce" }}
        >
            <VictoryAxis
                axisLabelComponent={<VictoryLabel x={177}/>}
                label = 'Damage'
                tickValues={[10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 240]}
                style = {styles.xaxis}
            />
            <VictoryAxis
                dependentAxis
                label = 'Penetration'
                tickValues={[10, 20, 30, 40, 50, 60, 70]}
                style = {styles.yaxis}
            />
            <VictoryScatter
                dataComponent = {<Symbol />}
                style={styles.scatter}
                // labelComponent={<VictoryLabel dy={-3} />}
                labelComponent={<VictoryLabel dy={-3} />}
                labels={({ datum }) => {
                    return datum.name;
                }}
                size={1}
                activeSize={5}
                data={props.listState}
                x="damage"
                y="penetration"
            />
            <VictoryScatter
                dataComponent = {<Symbol />}
                style={styles.scatter}
                labelComponent={<VictoryLabel dy={-3} />}
                // labelComponent={<VictoryTooltip
                //     labelComponent = {<VictoryLabel dy={-3} />}
                // />}
                labels={({ datum }) => {
                    return datum.name;
                }}
                size={1}
                activeSize={5}
                data={props.listState}
                x="damage"
                y="penetration"
            />
            <VictoryLegend
                data={props.legendData}
                dataComponent = {<Symbol />}
                title={'Filter by caliber'}
                labelComponent={<LegendLabel selectedDatumName={props.selectedLegendName} />}
                events={[
                    {
                        target: "labels",
                        eventHandlers: {
                            onClick: props.handleLegendClick
                        }
                    }
                ]}
                gutter={10}
                orientation="vertical"
                style={styles.legend}
                x={312}
                y={9}
            />
            <VictoryLine
                style={styles.annoationLine}
                labels={["Chest HP"]}
                labelComponent={
                    <VictoryLabel
                        y={85}
                        x={158}
                    />
                }
                x={() => 85}
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
    );
}

export default Graph;
