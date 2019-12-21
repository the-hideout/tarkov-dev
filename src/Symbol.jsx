import React from 'react';

import shapes from './points/';

class Symbol extends React.Component {
    render() {
        const {x, y, datum} = this.props;
        const PointComponent = shapes[datum.symbol.type];
        
        return (
            <PointComponent
                width="3"
                height="3"
                fill={datum.symbol.fill}
                x={x-1.5}
                y={y-1.5}
            />
        );
    }
} 
    
export default Symbol;
