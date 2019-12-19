import React from 'react';

import symbols from './symbols';
import shapes from './points/';

const getSymbol = function getSymbol(datum){
    for(const symbolSettings of symbols){
        for(const match of symbolSettings.match){
            if(datum.type.indexOf(match) === 0){
                return symbolSettings.symbol;
            }
        }
    }
    
    console.log(`No symbol defined for ${datum.type}`);
    
    return {
        type: 'Square',
        fill: 'green'
    };
};

class CatPoint extends React.Component {
    render() {
        const {x, y, datum} = this.props;
        const symbol = getSymbol(datum);
        const PointComponent = shapes[symbol.type];
        
        return (
            <PointComponent
                width="3"
                height="3"
                fill={symbol.fill}
                x={x-1.5}
                y={y-1.5}
            />
        );
    }
} 
    
export default CatPoint;
