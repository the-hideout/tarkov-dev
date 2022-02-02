import React from 'react';
import { VictoryLabel, VictoryTooltip } from 'victory';

class GraphLabel extends React.Component {
    static defaultEvents = VictoryTooltip.defaultEvents;

    render() {
        return (
            <g>
                <VictoryLabel {...this.props} />
                <VictoryTooltip
                    {...this.props}
                    // x={0}
                    // y={50}
                    text={`# ${this.props.text}`}
                    orientation="top"
                    pointerLength={0}
                    cornerRadius={5}
                    width={10}
                    height={10}
                    flyoutStyle={{
                        fill: 'black',
                    }}
                />
            </g>
        );
    }
}

export default GraphLabel;
