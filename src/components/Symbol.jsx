import React from 'react';

import shapes from './points';


class Symbol extends React.Component {
    render() {
        const {x, y, datum} = this.props;
        const PointComponent = shapes[datum.symbol.type];
        
        return (
            <PointComponent
                fill={datum.symbol.fill}
            />
        );
    }
} 
    
export default Symbol;
