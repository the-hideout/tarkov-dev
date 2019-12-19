import React from 'react';

class Square extends React.Component {
    render() {
        return (
            <rect 
                {...this.props}
            />
        );
    }
};

export default Square;
