import React from 'react';

import symbols from './symbols';

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
        type: '◢',
        fill: 'green'
    };
};

class CatPoint extends React.Component {
    render() {
        const {x, y, datum} = this.props;
        console.log(this.props);
        const symbol = getSymbol(datum);
        
        return (
            <text
                x={x}
                y={y}
                fontSize={5}
                fill={symbol.fill}
                textAlign= 'center'
                width={5}
            >
                {symbol.type}
            </text>
        );
    }
} 
    
export default CatPoint;
