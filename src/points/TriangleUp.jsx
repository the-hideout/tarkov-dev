import React from 'react';

class TriangleUp extends React.Component {
    render() {
        return (
            <svg
                {...this.props}
                viewBox="0 0 300 300"
                xmlns="http://www.w3.org/2000/svg" 
            >
                <path
                    d="M0 225,L150 75,L300 225,Z"
                />
            </svg>
        );
    }
};

export default TriangleUp;
