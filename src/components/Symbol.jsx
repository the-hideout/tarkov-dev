import { Component } from 'react';

import shapes from './points';

const SIZE = 2;

class Symbol extends Component {
    render() {
        const {x, y, datum} = this.props;
        const PointComponent = shapes[datum.symbol.type];
        
        return (
            <PointComponent
                width={SIZE}
                height={SIZE}
                fill={datum.symbol.fill}
                x={x - SIZE / 2}
                y={y - SIZE / 2}
            />
        );
    }
} 
export default Symbol;
