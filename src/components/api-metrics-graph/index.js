import { useQuery } from 'react-query';
import {
    VictoryChart,
    VictoryLine,
    VictoryTheme,
    VictoryAxis,
    VictoryLabel,
    VictoryVoronoiContainer,
} from 'victory';

import './index.css';

const API_METRICS_ENDPOINT = 'https://status.tarkov.dev/api/status-page/heartbeat/api'

const fetchApiData = async () => {
    const res = await fetch(API_METRICS_ENDPOINT);
    return res.json();
};

function ApiMetricsGraph() {
    const { status, data } = useQuery(`api-metrics`, fetchApiData, { refetchOnMount: false, refetchOnWindowFocus: false });

    let height = VictoryTheme.material.height;

    if (window.innerWidth < 760) {
        height = 1280;
    }

    if (status !== 'success') {
        return null;
    }

    if (status === 'success' && data.heartbeatList["1"] === 0) {
        return 'No data';
    }

    let max = 0;

    data.heartbeatList["1"].map((heartbeat) => {
        if (heartbeat.ping > max) {
            max = heartbeat.ping;
        }

        return true;
    });

    return (
        <div className="api-metrics-wrapper">
            <VictoryLabel text="API Latency in milliseconds" x={225} y={30}/>
            <VictoryChart
                height={height}
                width={900}
                padding={{ top: 20, left: 15, right: -100, bottom: 30 }}
                minDomain={{ y: 0 }}
                maxDomain={{ y: max + max * 0.1 }}
                theme={VictoryTheme.material}
                containerComponent={
                    <VictoryVoronoiContainer
                        labels={({ datum }) => `${(datum.y)}`}
                    />
                }
            >
                <VictoryAxis dependentAxis tickFormat={(tick) => `${Math.round(tick)}ms`}/>
                <VictoryLine
                    animate={{
                        duration: 1000,
                        onLoad: { duration: 1000 }
                    }}
                    interpolation="natural"
                    padding={{ right: -120 }}
                    scale={{
                        x: 'time',
                        y: 'linear',
                    }}
                    style={{
                        data: {
                            stroke: '#3b9c3a',
                            strokeWidth: 4,
                        },
                        parent: { border: '1px solid #ccc' },
                    }}
                    data={data.heartbeatList["1"].map((heartbeat) => {
                        return {
                            x: new Date(heartbeat.time),
                            y: heartbeat.ping,
                        };
                    })}
                />
            </VictoryChart>
        </div>
    );
}

export default ApiMetricsGraph;
