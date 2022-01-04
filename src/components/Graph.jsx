import {useCallback, useMemo} from 'react';
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
import {useNavigate} from 'react-router-dom';

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

const getMarkerLine = (xMax, xTarget, label) => {
    if(xMax < xTarget + 1){
        return null;
    }

    return <VictoryLine
        style={styles.annotionLine}
        labels={[label]}
        key={label}
        labelComponent={
            <VictoryLabel
                textAnchor = 'middle'
                verticalAnchor = 'middle'
                dx = {xMax - 40}
                dy = {-3}
            />
        }
        x={() => xTarget}
    />
};

const getArmorLabel = (tier, yMax, xMax) => {
    if(tier * 10 > yMax){
        return null;
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

const xTickValues = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 240];
const yTickValues = [10, 20, 30, 40, 50, 60, 70];

const chartAnimate = { duration: 500 };
const chartPadding = { top: 10, bottom: 20, right: 50, left: 20 };
const chartMinDomain = { y: 0, x: 0 };
const chartMaxDomain = { y: MAX_PENETRATION, x: MAX_DAMAGE };

const Graph = props => {
    const {xMax, yMax, listState} = props;

    const navigate = useNavigate();

    const handleLabelClick = useCallback((event, data) => {
        navigate(`/item/${data.datum.id.toString()}`);
    }, [navigate])

    const markerLines = useMemo(() => {
        return [
            getMarkerLine(xMax, 85, 'PMC & Scav Thorax HP'),
            getMarkerLine(xMax, 145, 'Reshala Thorax HP'),
            getMarkerLine(xMax, 160, 'Raider Thorax HP'),
            getMarkerLine(xMax, 180, 'Shturman Thorax HP'),
            getMarkerLine(xMax, 200, 'Cultist Priest Thorax HP'),
            getMarkerLine(xMax, 220, 'Cultist Warrior Thorax HP'),
            getArmorLabel(1, yMax, xMax),
            getArmorLabel(2, yMax, xMax),
            getArmorLabel(3, yMax, xMax),
            getArmorLabel(4, yMax, xMax),
            getArmorLabel(5, yMax, xMax),
            getArmorLabel(6, yMax, xMax),
        ].filter(Boolean);
    }, [xMax, yMax]);

    const scatterData = useMemo(() => {
        return listState.map((ls) => {
            return {
                x: ls.displayDamage,
                y: ls.displayPenetration,
                label: ls.chartName,
                symbol: ls.symbol,
                id: ls.id,
            };
        })
    }, [listState])

    return (
        <VictoryChart
            domainPadding={10}
            padding={chartPadding}
            height={180}
            theme={VictoryTheme.material}
            minDomain={chartMinDomain}
            maxDomain={chartMaxDomain}
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
                tickValues={xTickValues}
                style = {styles.xaxis}
            />
            <VictoryAxis
                dependentAxis
                label = 'Penetration'
                tickValues={yTickValues}
                style = {styles.yaxis}
            />
            <VictoryScatter
                dataComponent = {<Symbol
                    link = {true}
                />}
                animate={chartAnimate}
                events={[
                    {
                      target: "labels",
                      eventHandlers: {
                        onClick: handleLabelClick
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
                size={1}
                activeSize={5}
                data={scatterData}
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
            { markerLines }
        </VictoryChart>
    );
}

export default Graph;
