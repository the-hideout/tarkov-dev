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
            // <text
            //     x={x}
            //     y={y}
            //     fontSize={5}
            //     fill={symbol.fill}
            //     textAlign= 'center'
            //     width={20}
            //     height={20}
            // ></text>
            <symbol.type
                width="3"
                height="3"
                fill={symbol.fill}
                x={x}
                y={y}
            />
            // <rect
            //     width="3"
            //     height="3"
            //     fill={symbol.fill}
            //     x={x}
            //     y={y}
            // />
        );
    }
} 
    
export default CatPoint;
