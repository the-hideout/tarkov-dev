import { Component } from 'react';

class TriangleUp extends Component {
    render() {
        return (
            <svg
                {...this.props}
                viewBox="0 0 300 300"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M0 150
                    L150 0
                    L300 150
                    L150 300
                    Z"
                />
            </svg>
        );
    }
}

export default TriangleUp;
