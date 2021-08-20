import {useMemo} from 'react';
import {
    VictoryChart,
    VictoryScatter,
    VictoryTheme,
    VictoryLegend,
    VictoryLine,
    VictoryLabel,
    VictoryAxis,
    // VictoryContainer,
    // VictoryTooltip,
    // VictoryVoronoiContainer,
    VictoryContainer,
} from 'victory';
import {useHistory} from 'react-router-dom';

import Symbol from './Symbol.jsx';
// import GraphLabel from './GraphLabel';

const MAX_DAMAGE = 170;
const MAX_PENETRATION = 70;

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
            width: 37,
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
    annotionLine: {
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

const getChestLine = xMax => {
    if(xMax < 86){
        return false;
    }

    return <VictoryLine
        style={styles.annotionLine}
        labels={["Chest HP"]}
        labelComponent={
            <VictoryLabel
                textAnchor = 'middle'
                verticalAnchor = 'middle'
                dx = {xMax / 2}
            />
        }
        x={() => 85}
    />
};

const getArmorLabel = (tier, yMax, xMax) => {
    if(tier * 10 > yMax){
        return false;
    }

    return <VictoryLabel
        key = {`class-${tier}-label`}
        text = {`Class ${tier}`}
        style = {styles.classLabel}
        datum = {{
            x: xMax / 100,
            y: tier * 10 + 1,
        }}
        textAnchor = "start"
        verticalAnchor = "end"
    />
};

const Graph = props => {
    const history = useHistory();
    const handleOnClick = (id) => history.push(`/item/${id.toString()}`);

    return (
        <VictoryChart
            animate={{duration: 200}}
            domainPadding={10}
            padding={{
                top: 10,
                bottom: 20,
                right: 50,
                left: 20,
            }}
            height={180}
            theme={VictoryTheme.material}
            minDomain = {{
                y: 0,
                x: 0,
            }}
            maxDomain = {{
                y: MAX_PENETRATION,
                x: MAX_DAMAGE,
            }}
            containerComponent={
                <VictoryContainer
                  style={{
                    touchAction: "auto"
                  }}
                />
              }
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
                dataComponent = {<Symbol
                    link = {true}
                />}
                events={[
                    {
                      target: "labels",
                      eventHandlers: {
                        onClick: (evt, data) => {
                            handleOnClick(data.datum.id);
                        }
                      }
                    }
                  ]}
                style={styles.scatter}
                // labelComponent={<GraphLabel
                //     dy={-3}
                // />}
                labelComponent={<VictoryLabel
                    dy = {-3}
                />}
                labels={({ datum }) => {
                    return datum.name;
                }}
                size={1}
                activeSize={5}
                data={props.listState}
                x="displayDamage"
                y="displayPenetration"
            />
            {/* <VictoryScatter
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
            /> */}
            <VictoryLegend
                data={props.legendData}
                dataComponent = {<Symbol
                    link = {false}
                />}
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
                x={308}
                y={9}
            />
            {
                getChestLine(props.xMax)
            }
            {
                getArmorLabel(1, props.yMax, props.xMax)
            }
            {
                getArmorLabel(2, props.yMax, props.xMax)
            }
            {
                getArmorLabel(3, props.yMax, props.xMax)
            }
            {
                getArmorLabel(4, props.yMax, props.xMax)
            }
            {
                getArmorLabel(5, props.yMax, props.xMax)
            }
            {
                getArmorLabel(6, props.yMax, props.xMax)
            }
        </VictoryChart>
    );
}

export default Graph;
